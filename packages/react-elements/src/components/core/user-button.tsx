"use client";

import * as React from "react";
import {
  ChevronRight,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { cn } from "../../lib/utils";
import {
  AUTHDOG_WEBSITE,
  getInitials,
  resolveUserDisplay,
  type UserButtonAccount,
  type UserButtonUser,
} from "./user-account-utils";

const SettingsIcon = Settings as ComponentType<React.SVGProps<SVGSVGElement>>;
const LogOutIcon = LogOut as ComponentType<React.SVGProps<SVGSVGElement>>;
const PlusIcon = Plus as ComponentType<React.SVGProps<SVGSVGElement>>;
const ChevronRightIcon = ChevronRight as ComponentType<
  React.SVGProps<SVGSVGElement>
>;

export type UserButtonAppearance = {
  elements?: {
    root?: string;
    trigger?: string;
    content?: string;
    footer?: string;
  };
};

export interface UserButtonProps {
  user: UserButtonUser;
  /** Other signed-in accounts available to switch to. Hidden when empty/omitted. */
  accounts?: UserButtonAccount[];
  onManageAccount?: () => void;
  onSignOut?: () => void;
  onSwitchAccount?: (accountId: string) => void;
  onAddAccount?: () => void;
  onSignOutAll?: () => void;
  /** Hide the Secured by Authdog footer band. */
  showSecuredBy?: boolean;
  className?: string;
  appearance?: UserButtonAppearance;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  modal?: boolean;
  /** Optional custom trigger; defaults to circular avatar. */
  trigger?: React.ReactElement;
}

const outlineActionClass =
  "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground shadow-none transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const UserButton = ({
  user,
  accounts = [],
  onManageAccount,
  onSignOut,
  onSwitchAccount,
  onAddAccount,
  onSignOutAll,
  showSecuredBy = true,
  className,
  appearance,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  modal = false,
  trigger,
}: UserButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const { displayName, email, avatar } = resolveUserDisplay(user);
  const initials = getInitials(displayName || email);
  const otherAccounts = accounts.filter(
    (account) =>
      account.id &&
      account.id !== user.id &&
      (account.email || account.emails?.[0]?.value) !== email,
  );
  const showMultiAccount =
    otherAccounts.length > 0 || Boolean(onAddAccount) || Boolean(onSignOutAll);

  const closeAnd = (fn?: () => void) => {
    setOpen(false);
    fn?.();
  };

  const defaultTrigger = (
    <button
      type="button"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background p-0 shadow-sm outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        appearance?.elements?.trigger,
      )}
      aria-label={displayName ? `Open account menu for ${displayName}` : "Open account menu"}
    >
      <Avatar className="size-8 rounded-full">
        <AvatarImage src={avatar} alt={displayName || email || "User"} />
        <AvatarFallback className="rounded-full bg-slate-800 text-[11px] font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
    </button>
  );

  return (
    <div className={cn("inline-flex", appearance?.elements?.root, className)}>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={modal}>
        <DropdownMenuTrigger asChild>
          {trigger ?? defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "w-[20rem] overflow-hidden rounded-2xl border border-border/80 bg-popover p-0 text-popover-foreground shadow-[0_8px_30px_rgba(15,23,42,0.12)]",
            appearance?.elements?.content,
          )}
        >
          {/* Active account */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 rounded-full">
                <AvatarImage src={avatar} alt={displayName || email || "User"} />
                <AvatarFallback className="rounded-full bg-slate-800 text-sm font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">
                  {displayName || "Account"}
                </div>
                {email ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {email}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={outlineActionClass}
                onClick={() => closeAnd(onManageAccount)}
              >
                <SettingsIcon className="size-3.5 text-muted-foreground" />
                Manage account
              </button>
              <button
                type="button"
                className={outlineActionClass}
                onClick={() => closeAnd(onSignOut)}
              >
                <LogOutIcon className="size-3.5 text-muted-foreground" />
                Sign out
              </button>
            </div>
          </div>

          {showMultiAccount ? (
            <>
              <DropdownMenuSeparator className="m-0" />

              {otherAccounts.length > 0 ? (
                <div className="py-1">
                  {otherAccounts.map((account) => {
                    const resolved = resolveUserDisplay(account);
                    return (
                      <DropdownMenuItem
                        key={account.id}
                        className="group cursor-pointer rounded-none px-3 py-2.5 focus:bg-muted/70"
                        onSelect={() =>
                          closeAnd(() => onSwitchAccount?.(account.id))
                        }
                      >
                        <Avatar className="size-8 rounded-full">
                          <AvatarImage
                            src={resolved.avatar}
                            alt={resolved.displayName || resolved.email}
                          />
                          <AvatarFallback className="rounded-full text-[10px] font-semibold">
                            {getInitials(
                              resolved.displayName || resolved.email,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {resolved.displayName || "Account"}
                          </div>
                          {resolved.email ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {resolved.email}
                            </div>
                          ) : null}
                        </div>
                        <ChevronRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-focus:opacity-100 group-data-[highlighted]:opacity-100" />
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ) : null}

              {(onAddAccount || onSignOutAll) && otherAccounts.length > 0 ? (
                <DropdownMenuSeparator className="m-0" />
              ) : null}

              {(onAddAccount || onSignOutAll) && (
                <div className="py-1">
                  {onAddAccount ? (
                    <DropdownMenuItem
                      className="cursor-pointer rounded-none px-3 py-2.5"
                      onSelect={() => closeAnd(onAddAccount)}
                    >
                      <span className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/40">
                        <PlusIcon className="size-3.5 text-muted-foreground" />
                      </span>
                      <span className="text-sm">Add account</span>
                    </DropdownMenuItem>
                  ) : null}
                  {onSignOutAll ? (
                    <DropdownMenuItem
                      className="cursor-pointer rounded-none px-3 py-2.5"
                      onSelect={() => closeAnd(onSignOutAll)}
                    >
                      <span className="inline-flex size-8 items-center justify-center">
                        <LogOutIcon className="size-4 text-muted-foreground" />
                      </span>
                      <span className="text-sm">Sign out of all accounts</span>
                    </DropdownMenuItem>
                  ) : null}
                </div>
              )}
            </>
          ) : null}

          {showSecuredBy ? (
            <>
              <DropdownMenuSeparator className="m-0" />
              <div
                className={cn(
                  "flex items-center justify-center gap-1 bg-muted/40 px-3 py-2.5 text-[11px] text-muted-foreground",
                  appearance?.elements?.footer,
                )}
              >
                <span>Secured by</span>
                <a
                  href={AUTHDOG_WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground/80 no-underline hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  Authdog
                </a>
              </div>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
