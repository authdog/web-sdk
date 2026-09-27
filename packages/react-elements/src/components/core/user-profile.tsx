"use client";

import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CircleCheck,
  Clock3,
  KeyRound,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import {
  BackupCodesRemainingCard,
  GroupsPanel,
  MfaStatusCard,
  PasskeysPanel,
  SessionsPanel,
  TokensPanel,
} from "./account-panels";
import type {
  AccountGroup,
  AccountSession,
  AccountTabId,
  AccountToken,
  AccountUser,
  ActionResult,
  PasskeyCredential,
  TotpStatus,
} from "./account-types";
import { SectionCard } from "./section-card";

export type {
  AccountGroup,
  AccountSession,
  AccountTabId,
  AccountToken,
  AccountUser,
  ActionResult,
  PasskeyCredential,
  TotpStatus,
} from "./account-types";

type TabConfig = {
  id: AccountTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const accountTabs: TabConfig[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Manage your personal details, emails, and linked account.",
    icon: User,
  },
  {
    id: "mfa",
    label: "MFA",
    description:
      "Protect your account with authenticator apps, passkeys, and recovery codes.",
    icon: CircleCheck,
  },
  {
    id: "sessions",
    label: "Sessions",
    description:
      "Review and revoke the devices and browsers that are signed in.",
    icon: Clock3,
  },
  {
    id: "groups",
    label: "Groups",
    description:
      "See which groups currently grant you access in this environment.",
    icon: Users,
  },
  {
    id: "tokens",
    label: "Tokens",
    description:
      "Create and manage personal access tokens for programmatic access.",
    icon: KeyRound,
  },
];

function getInitials(name?: string) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "U";
  return trimmed
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function hasSuccess(r: unknown): r is ActionResult {
  return !!r && typeof r === "object" && "success" in r;
}

export interface UserProfileProps {
  loading: boolean;
  user: AccountUser | null | undefined;
  logo?: ReactNode;
  productName?: string;
  onClose?: () => void;
  handleAuthenticated?: () => void;
  onTabChange?: (tab: AccountTabId) => void;
  onRequestEmailVerification?: (
    email: string,
  ) => Promise<ActionResult | void> | ActionResult | void;
  onVerifyEmail?: (
    email: string,
    code: string,
  ) => Promise<ActionResult | void> | ActionResult | void;
  onAddEmail?: (
    email: string,
  ) => Promise<ActionResult | void> | ActionResult | void;
  totpStatus?: TotpStatus;
  onGenerateTotpSecret?: () => Promise<ActionResult | void> | ActionResult | void;
  onEnableTotp?: (
    secret: string,
    code: string,
  ) => Promise<ActionResult | void> | ActionResult | void;
  onDisableTotp?: (
    code: string,
  ) => Promise<ActionResult | void> | ActionResult | void;
  onVerifyTotp?: (
    code: string,
  ) => Promise<ActionResult | void> | ActionResult | void;
  sessions?: AccountSession[];
  sessionsLoading?: boolean;
  onRevokeSession?: (sessionId: string) => Promise<void> | void;
  groups?: AccountGroup[];
  groupsLoading?: boolean;
  tokens?: AccountToken[];
  tokensLoading?: boolean;
  onCreateToken?: () => Promise<void> | void;
  onRevokeToken?: (tokenId: string) => Promise<void> | void;
  passkeys?: PasskeyCredential[];
  passkeysLoading?: boolean;
  onAddPasskey?: () => Promise<void> | void;
  onRemovePasskey?: (id: string) => Promise<void> | void;
}

/** Presentational Account shell (Profile / MFA / Sessions / Groups / Tokens). */
export const UserProfile = ({
  loading,
  user,
  logo,
  productName = "Account",
  onClose,
  handleAuthenticated,
  onTabChange,
  onRequestEmailVerification,
  onVerifyEmail,
  onAddEmail,
  totpStatus,
  onGenerateTotpSecret,
  onEnableTotp,
  onDisableTotp,
  onVerifyTotp,
  sessions,
  sessionsLoading,
  onRevokeSession,
  groups,
  groupsLoading,
  tokens,
  tokensLoading,
  onCreateToken,
  onRevokeToken,
  passkeys,
  passkeysLoading,
  onAddPasskey,
  onRemovePasskey,
}: UserProfileProps) => {
  const EMAIL_VERIFICATION_CODE_LENGTH = 6;
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTabId>("profile");
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  const [codeByEmail, setCodeByEmail] = useState<Record<string, string>>({});
  const [emailCodeErrorByEmail, setEmailCodeErrorByEmail] = useState<
    Record<string, string>
  >({});
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [generatingSecret, setGeneratingSecret] = useState(false);
  const [enableTotpFlow, setEnableTotpFlow] = useState<{
    secret?: string;
    qrCodeDataUrl?: string;
  } | null>(null);
  const [enablingTotp, setEnablingTotp] = useState(false);
  const [disablingTotp, setDisablingTotp] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [displayedBackupCodes, setDisplayedBackupCodes] = useState<string[]>(
    [],
  );
  const [verifyTotpCode, setVerifyTotpCode] = useState("");
  const [showDisableTotp, setShowDisableTotp] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && handleAuthenticated) {
      handleAuthenticated();
    }
  }, [loading, user, handleAuthenticated]);

  const handleTabChange = (tab: AccountTabId) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const normalizeEmailVerificationCode = (value: string) =>
    value.replace(/\D/g, "").slice(0, EMAIL_VERIFICATION_CODE_LENGTH);

  const handleEmailVerificationSubmit = async (
    email: string,
    rawCode: string,
  ) => {
    if (!onVerifyEmail) return;
    const normalizedCode = normalizeEmailVerificationCode(rawCode);
    if (normalizedCode.length !== EMAIL_VERIFICATION_CODE_LENGTH) {
      setEmailCodeErrorByEmail((map) => ({
        ...map,
        [email]: "Verification code must be 6 digits.",
      }));
      return;
    }
    const result = await onVerifyEmail(email, normalizedCode);
    if (hasSuccess(result) && !result.success) {
      setEmailCodeErrorByEmail((map) => ({
        ...map,
        [email]: result.message || "Invalid verification code",
      }));
      return;
    }
    setCodeByEmail((map) => ({ ...map, [email]: "" }));
    setEmailCodeErrorByEmail((map) => ({ ...map, [email]: "" }));
    setVerifyingEmail(null);
  };

  const handleGenerateSecret = async () => {
    if (!onGenerateTotpSecret) return;
    setGeneratingSecret(true);
    try {
      const result = await onGenerateTotpSecret();
      if (hasSuccess(result) && result.success && result.secret) {
        setEnableTotpFlow({
          secret: result.secret,
          qrCodeDataUrl: result.qrCodeDataUrl,
        });
      }
    } finally {
      setGeneratingSecret(false);
    }
  };

  const handleEnableTotp = async () => {
    if (!onEnableTotp || !enableTotpFlow?.secret || !totpCode) return;
    setEnablingTotp(true);
    try {
      const result = await onEnableTotp(enableTotpFlow.secret, totpCode);
      if (hasSuccess(result) && result.success) {
        setDisplayedBackupCodes(result.backupCodes || []);
        setShowBackupCodes(Boolean(result.backupCodes?.length));
        setEnableTotpFlow(null);
        setTotpCode("");
      }
    } finally {
      setEnablingTotp(false);
    }
  };

  const handleDisableTotp = async () => {
    if (!verifyTotpCode) return;
    setDisablingTotp(true);
    try {
      if (onVerifyTotp) {
        const verify = await onVerifyTotp(verifyTotpCode);
        if (!hasSuccess(verify) || !verify.success) return;
      }
      if (!onDisableTotp) return;
      const result = await onDisableTotp(verifyTotpCode);
      if (hasSuccess(result) && result.success) {
        setVerifyTotpCode("");
        setShowDisableTotp(false);
      }
    } finally {
      setDisablingTotp(false);
    }
  };

  const userEmails = user?.emails || [];
  const primaryEmail =
    userEmails.find((e) => e.primary)?.value ||
    userEmails[0]?.value ||
    user?.userName ||
    "No email";

  const verifiedEmailCount = useMemo(
    () =>
      userEmails.filter((email) => {
        if (typeof email.verified === "boolean") return email.verified;
        const verification = (user?.verifications || []).find(
          (item) => item.email === email.value,
        );
        return verification?.verified === true;
      }).length,
    [user?.verifications, userEmails],
  );

  const activeTabConfig: TabConfig =
    accountTabs.find((tab) => tab.id === activeTab) ?? accountTabs[0]!;

  if (!isMounted || loading) {
    return (
      <div className="flex h-full min-h-[28rem] items-center justify-center rounded-2xl border border-border/70 bg-background/60">
        <div className="text-sm text-muted-foreground">
          Loading account settings...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full min-h-[28rem] items-center justify-center rounded-2xl border border-dashed border-border bg-background/60">
        <div className="text-sm text-muted-foreground">
          No user data available.
        </div>
      </div>
    );
  }

  const sidebarFooter = (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/70 p-2">
      <Avatar className="h-9 w-9 border border-border/70">
        <AvatarImage
          src={user.photos?.[0]?.value}
          alt={`${user.displayName || "User"} avatar`}
        />
        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {user.displayName || "Account"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{primaryEmail}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-0 overflow-hidden bg-muted/20 lg:flex-row lg:gap-4 lg:bg-transparent">
      <aside className="hidden min-w-0 lg:flex lg:h-full lg:w-[14rem] lg:shrink-0 lg:flex-col">
        <div className="flex min-h-0 flex-col rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur lg:h-full">
          <div className="border-b border-border/70 pb-3">
            <div className="flex items-start gap-2.5">
              {logo ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 dark:bg-white dark:ring-white/15">
                  {logo}
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {productName}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Manage your account info.
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-3 grid gap-1 pb-2">
            {accountTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "bg-muted text-primary"
                      : "text-foreground/75 hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-background text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-sm font-medium">{tab.label}</div>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-3">{sidebarFooter}</div>
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto lg:overflow-visible">
        <div className="mx-auto flex min-w-0 w-full max-w-2xl flex-col bg-transparent lg:mx-0 lg:h-full lg:min-h-0 lg:max-w-none lg:flex-1 lg:rounded-xl lg:border lg:border-border/70 lg:bg-card/80 lg:shadow-sm lg:backdrop-blur">
          <div className="relative px-4 pb-3 pt-4 sm:px-5 lg:border-b lg:border-border/70 lg:py-3">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close account"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:pr-10">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                  {activeTabConfig.label}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {activeTabConfig.description}
                </p>
              </div>
              <div className="flex max-w-full flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
                <Badge
                  variant="outline"
                  className="hidden rounded-full border-border/70 bg-background/80 px-3 py-1 text-xs lg:inline-flex"
                >
                  {user.provider || "Local account"}
                </Badge>
                <Badge
                  className={cn(
                    "rounded-full px-3 py-1 text-xs",
                    totpStatus?.enabled
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {totpStatus?.enabled ? "MFA enabled" : "MFA recommended"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="px-3 pb-4 sm:px-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:py-5">
            {activeTab === "profile" ? (
              <div className="space-y-3 lg:space-y-4">
                <SectionCard
                  title="Profile"
                  description="Basic identity details for this account."
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border/70">
                        <AvatarImage
                          src={user.photos?.[0]?.value}
                          alt={`${user.displayName || "User"} avatar`}
                        />
                        <AvatarFallback>
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {user.displayName || "Unknown user"}
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-sm">
                          Signed in with {user.provider || "your account"}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit rounded-full bg-muted/60 px-3 py-1 text-xs"
                    >
                      Account owner
                    </Badge>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Email addresses"
                  description="Verified emails are used for sign-in, recovery, and security notifications."
                  action={
                    !addingEmail && userEmails.length < 5 && onAddEmail ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setAddingEmail(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add email
                      </Button>
                    ) : null
                  }
                >
                  <div className="space-y-3">
                    {userEmails.map((email, idx) => {
                      const verification = (user.verifications || []).find(
                        (item) => item.email === email.value,
                      );
                      const isVerified =
                        typeof email.verified === "boolean"
                          ? email.verified
                          : verification?.verified === true ||
                            (idx === 0 && verifiedEmailCount > 0);
                      const codeInput = codeByEmail[email.value] || "";
                      const codeError =
                        emailCodeErrorByEmail[email.value] || "";
                      const isCodeValid =
                        normalizeEmailVerificationCode(codeInput).length ===
                        EMAIL_VERIFICATION_CODE_LENGTH;

                      return (
                        <div
                          key={email.value}
                          className="rounded-lg border border-border/70 bg-background p-3"
                        >
                          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="break-all text-sm font-medium text-foreground">
                                {email.value}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge
                                  className={cn(
                                    "rounded-full px-3 py-1 text-xs",
                                    isVerified
                                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                                  )}
                                >
                                  {isVerified ? "Verified" : "Not verified"}
                                </Badge>
                                {idx === 0 || email.primary ? (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full bg-muted/60 px-3 py-1 text-xs"
                                  >
                                    Primary
                                  </Badge>
                                ) : null}
                              </div>
                            </div>

                            {!isVerified ? (
                              verifyingEmail === email.value ? (
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[18rem]">
                                  <Input
                                    className="h-9"
                                    placeholder="Verification code"
                                    value={codeInput}
                                    onChange={(e) => {
                                      const nextCode =
                                        normalizeEmailVerificationCode(
                                          e.target.value,
                                        );
                                      setCodeByEmail((map) => ({
                                        ...map,
                                        [email.value]: nextCode,
                                      }));
                                      setEmailCodeErrorByEmail((map) => ({
                                        ...map,
                                        [email.value]: "",
                                      }));
                                    }}
                                  />
                                  {codeError ? (
                                    <p className="text-xs text-destructive">
                                      {codeError}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      Enter the 6-digit code sent to this email.
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      disabled={!isCodeValid}
                                      onClick={() =>
                                        void handleEmailVerificationSubmit(
                                          email.value,
                                          codeInput,
                                        )
                                      }
                                    >
                                      Verify
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setVerifyingEmail(null);
                                        setCodeByEmail((map) => ({
                                          ...map,
                                          [email.value]: "",
                                        }));
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    if (onRequestEmailVerification) {
                                      await onRequestEmailVerification(
                                        email.value,
                                      );
                                    }
                                    setVerifyingEmail(email.value);
                                  }}
                                >
                                  Send code
                                </Button>
                              )
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                                Ready for sign-in
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {addingEmail ? (
                      <Card className="border-dashed border-border/80 bg-muted/20 py-0 shadow-none">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">
                            Add email address
                          </CardTitle>
                          <CardDescription>
                            You&apos;ll need to verify the new address before it
                            can be used on this account.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-0">
                          <div className="space-y-2">
                            <Label htmlFor="new-email">Email address</Label>
                            <Input
                              id="new-email"
                              placeholder="name@company.com"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="justify-end gap-2 p-4">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setAddingEmail(false);
                              setNewEmail("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              const value = String(newEmail || "")
                                .trim()
                                .toLowerCase();
                              if (!value) return;
                              if (onAddEmail) await onAddEmail(value);
                              setAddingEmail(false);
                              setNewEmail("");
                            }}
                          >
                            Add email
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : null}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Connected account"
                  description="Identity provider currently linked to this account."
                >
                  <div className="flex flex-col gap-2.5 rounded-lg border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.provider || "Unknown provider"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {primaryEmail}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit rounded-full bg-muted/60 px-3 py-1 text-xs"
                    >
                      Active connection
                    </Badge>
                  </div>
                </SectionCard>
              </div>
            ) : null}

            {activeTab === "mfa" ? (
              <div className="space-y-4">
                {enableTotpFlow ? (
                  <SectionCard
                    title="Set up authenticator app"
                    description="Scan the QR code or use the secret manually, then enter the 6-digit code from your app."
                  >
                    <div className="space-y-4">
                      {enableTotpFlow.qrCodeDataUrl ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-muted/20 p-5">
                          <div className="rounded-2xl border-2 border-border bg-white p-4 shadow-sm">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(enableTotpFlow.qrCodeDataUrl)}`}
                              alt="TOTP QR Code"
                              className="h-52 w-52"
                            />
                          </div>
                        </div>
                      ) : null}
                      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Manual setup key
                        </p>
                        <code className="break-all rounded-xl bg-background px-3 py-2 font-mono text-sm text-foreground">
                          {enableTotpFlow.secret}
                        </code>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totp-code">
                          Enter the 6-digit code from your app
                        </Label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            id="totp-code"
                            placeholder="000000"
                            value={totpCode}
                            onChange={(e) =>
                              setTotpCode(
                                e.target.value.replace(/\D/g, "").slice(0, 6),
                              )
                            }
                            maxLength={6}
                            className="font-mono text-center tracking-[0.35em] sm:max-w-xs"
                          />
                          <Button
                            onClick={() => void handleEnableTotp()}
                            disabled={totpCode.length !== 6 || enablingTotp}
                          >
                            {enablingTotp ? "Verifying..." : "Verify and enable"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEnableTotpFlow(null);
                              setTotpCode("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                ) : null}

                {showBackupCodes && displayedBackupCodes.length > 0 ? (
                  <SectionCard
                    title="Save your backup codes"
                    description="Store these codes somewhere safe. Each code can be used once if you lose access to your authenticator."
                  >
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {displayedBackupCodes.map((code) => (
                        <div
                          key={code}
                          className="rounded-xl border border-border/70 bg-background px-3 py-2"
                        >
                          <code className="font-mono text-sm">{code}</code>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setShowBackupCodes(false)}
                    >
                      I&apos;ve saved these codes
                    </Button>
                  </SectionCard>
                ) : null}

                <MfaStatusCard
                  enabled={Boolean(totpStatus?.enabled)}
                  generating={generatingSecret}
                  onSetup={() => void handleGenerateSecret()}
                  onRemove={
                    onDisableTotp
                      ? () => {
                          setShowDisableTotp(true);
                          setVerifyTotpCode("");
                        }
                      : undefined
                  }
                />

                {totpStatus?.enabled && showDisableTotp ? (
                  <div className="rounded-2xl border border-red-200/80 bg-red-50/70 p-4 dark:border-red-900/60 dark:bg-red-950/20">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Enter your current TOTP code or a backup code to disable
                      multifactor authentication.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        placeholder="Enter code"
                        value={verifyTotpCode}
                        onChange={(e) =>
                          setVerifyTotpCode(
                            e.target.value.replace(/\D/g, "").slice(0, 8),
                          )
                        }
                        className="font-mono text-center sm:max-w-xs"
                      />
                      <Button
                        variant="destructive"
                        onClick={() => void handleDisableTotp()}
                        disabled={verifyTotpCode.length < 6 || disablingTotp}
                      >
                        {disablingTotp ? "Disabling..." : "Disable MFA"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDisableTotp(false);
                          setVerifyTotpCode("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}

                <PasskeysPanel
                  passkeys={passkeys}
                  loading={passkeysLoading}
                  onAddPasskey={onAddPasskey}
                  onRemovePasskey={onRemovePasskey}
                />

                {totpStatus?.enabled ? (
                  <BackupCodesRemainingCard
                    remaining={totpStatus.backupCodesRemaining ?? 0}
                  />
                ) : null}
              </div>
            ) : null}

            {activeTab === "sessions" ? (
              <SessionsPanel
                sessions={sessions}
                loading={sessionsLoading}
                onRevokeSession={onRevokeSession}
              />
            ) : null}

            {activeTab === "groups" ? (
              <GroupsPanel groups={groups} loading={groupsLoading} />
            ) : null}

            {activeTab === "tokens" ? (
              <TokensPanel
                tokens={tokens}
                loading={tokensLoading}
                onCreateToken={onCreateToken}
                onRevokeToken={onRevokeToken}
              />
            ) : null}
          </div>
        </div>
      </section>

      <nav
        aria-label="Account sections"
        className="z-30 shrink-0 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-0.5 px-1.5 py-1">
          {accountTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

/** Alias for docs / drop-in Account usage. */
export const Account = UserProfile;
