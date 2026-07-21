"use client";

import { Clock3, KeyRound, ShieldCheck, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SectionCard } from "./section-card";
import type {
  AccountGroup,
  AccountSession,
  AccountToken,
  PasskeyCredential,
} from "./account-types";
import { cn } from "../../lib/utils";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value.includes(" ") ? value.replace(" ", "T") : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SessionsPanel({
  sessions = [],
  loading,
  onRevokeSession,
}: {
  sessions?: AccountSession[];
  loading?: boolean;
  onRevokeSession?: (sessionId: string) => Promise<void> | void;
}) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading sessions...</p>
    );
  }

  if (!sessions.length) {
    return (
      <SectionCard
        title="Active sessions"
        description="Review and revoke the devices and browsers that are signed in."
      >
        <p className="text-sm text-muted-foreground">No active sessions.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Active sessions"
      description="Review and revoke the devices and browsers that are signed in."
    >
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {session.userAgent || "Unknown device"}
                </p>
                {session.current ? (
                  <Badge className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                    Current
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {[session.ipAddress, session.location]
                  .filter(Boolean)
                  .join(" · ") || "Location unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                Started {formatDate(session.createdAt)}
              </p>
            </div>
            {!session.current && onRevokeSession ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void onRevokeSession(session.id)}
              >
                Revoke
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function GroupsPanel({
  groups = [],
  loading,
}: {
  groups?: AccountGroup[];
  loading?: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading groups...</p>;
  }

  if (!groups.length) {
    return (
      <SectionCard
        title="Groups"
        description="See which groups currently grant you access in this environment."
      >
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
          <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You are not a member of any groups yet.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Groups"
      description="See which groups currently grant you access in this environment."
    >
      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-lg border border-border/70 bg-background p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {group.name}
                </p>
                {group.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.description}
                  </p>
                ) : null}
              </div>
              {typeof group.memberCount === "number" ? (
                <Badge variant="outline" className="rounded-full text-xs">
                  {group.memberCount} members
                </Badge>
              ) : null}
            </div>
            {group.joinedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Joined {formatDate(group.joinedAt)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function TokensPanel({
  tokens = [],
  loading,
  onCreateToken,
  onRevokeToken,
}: {
  tokens?: AccountToken[];
  loading?: boolean;
  onCreateToken?: () => Promise<void> | void;
  onRevokeToken?: (tokenId: string) => Promise<void> | void;
}) {
  return (
    <SectionCard
      title="API Tokens"
      description="Create and manage personal access tokens for programmatic access."
      action={
        onCreateToken ? (
          <Button variant="outline" size="sm" onClick={() => void onCreateToken()}>
            Create token
          </Button>
        ) : null
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tokens...</p>
      ) : !tokens.length ? (
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
          <KeyRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No personal access tokens yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {token.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {token.prefix ? `${token.prefix}…` : "Token"} · Created{" "}
                  {formatDate(token.createdAt)}
                </p>
              </div>
              {onRevokeToken ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                  onClick={() => void onRevokeToken(token.id)}
                >
                  Revoke
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function PasskeysPanel({
  passkeys = [],
  loading,
  onAddPasskey,
  onRemovePasskey,
}: {
  passkeys?: PasskeyCredential[];
  loading?: boolean;
  onAddPasskey?: () => Promise<void> | void;
  onRemovePasskey?: (id: string) => Promise<void> | void;
}) {
  return (
    <SectionCard
      title="Passkeys"
      description="Use device biometrics or a security key as a phishing-resistant sign-in method."
      action={
        onAddPasskey ? (
          <Button variant="outline" size="sm" onClick={() => void onAddPasskey()}>
            Add passkey
          </Button>
        ) : null
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading passkeys...</p>
      ) : !passkeys.length ? (
        <p className="text-sm text-muted-foreground">No passkeys registered.</p>
      ) : (
        <div className="space-y-3">
          {passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {passkey.name || "Passkey"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Added {formatDate(passkey.createdAt)}
                </p>
              </div>
              {onRemovePasskey ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void onRemovePasskey(passkey.id)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function MfaStatusCard({
  enabled,
  onSetup,
  onRemove,
  generating,
}: {
  enabled: boolean;
  onSetup?: () => void;
  onRemove?: () => void;
  generating?: boolean;
}) {
  return (
    <SectionCard
      title="Authenticator app"
      description="Use a TOTP-compatible app to generate time-based verification codes."
    >
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background/80 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl",
              enabled
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              TOTP authenticator
            </p>
            <p className="text-sm text-muted-foreground">
              {enabled
                ? "Configured and protecting your account."
                : "Not configured yet."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              enabled
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            {enabled ? "Enabled" : "Not configured"}
          </Badge>
          {enabled ? (
            onRemove ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={onRemove}
              >
                Remove
              </Button>
            ) : null
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onSetup}
              disabled={generating || !onSetup}
            >
              {generating ? "Generating..." : "Set up"}
            </Button>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export function BackupCodesRemainingCard({ remaining }: { remaining: number }) {
  return (
    <SectionCard
      title="Backup codes"
      description="Keep a recovery option available in case your authenticator app is unavailable."
    >
      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">
            Recovery codes
          </div>
          <div className="text-sm text-muted-foreground">
            {remaining} codes remaining
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
