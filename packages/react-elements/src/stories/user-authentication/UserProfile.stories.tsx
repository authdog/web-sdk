"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";

import { UserButton } from "../../components/core/user-button";
import { Account } from "../../components/core/user-profile";
import {
  accountLogo,
  demoGroups,
  demoPasskeys,
  demoSessions,
  demoTokens,
  demoUser,
} from "../_fixtures";
import { HostedPreview } from "../_hosted";

const defaultArgs = {
  loading: false,
  user: demoUser,
  productName: "Account",
  logo: accountLogo,
  totpStatus: { enabled: false, backupCodesRemaining: 0 },
  sessions: demoSessions,
  groups: demoGroups,
  tokens: demoTokens,
  passkeys: demoPasskeys,
  onRequestEmailVerification: async () => ({ success: true }),
  onVerifyEmail: async () => ({ success: true }),
  onAddEmail: async () => ({ success: true }),
  onGenerateTotpSecret: async () => ({
    success: true,
    secret: "JBSWY3DPEHPK3PXP",
    qrCodeDataUrl: "otpauth://totp/Authdog:alex.rivera@example.com?secret=JBSWY3DPEHPK3PXP",
  }),
  onEnableTotp: async () => ({
    success: true,
    backupCodes: ["A1B2C3D4", "E5F6G7H8", "I9J0K1L2", "M3N4O5P6"],
  }),
  onDisableTotp: async () => ({ success: true }),
  onRevokeSession: async (id: string) => console.log("revoke", id),
  onCreateToken: async () => console.log("create token"),
  onRevokeToken: async (id: string) => console.log("revoke token", id),
  onAddPasskey: async () => console.log("add passkey"),
  onRemovePasskey: async (id: string) => console.log("remove passkey", id),
};

const meta = {
  title: "User Authentication/UserProfile",
  component: Account,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`<UserProfile />` — full account management shell: Profile, MFA, Sessions, Groups, and Tokens. Exported as `UserProfile` / `Account`; presentational — supply data and async callbacks from the host. Also available as the hosted `/account` identity screen.",
      },
    },
  },
  render: (args) => (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <div className="mx-auto h-[42rem] max-w-5xl">
        <Account {...args} />
      </div>
    </div>
  ),
} satisfies Meta<typeof Account>;

export default meta;

type Story = StoryObj<typeof Account>;

export const Default: Story = {
  args: defaultArgs,
};

export const WithMfaEnabled: Story = {
  args: {
    ...defaultArgs,
    totpStatus: { enabled: true, backupCodesRemaining: 8 },
  },
};

export const Loading: Story = {
  args: {
    ...defaultArgs,
    loading: true,
  },
};

export const EmptyLists: Story = {
  args: {
    ...defaultArgs,
    sessions: [],
    groups: [],
    tokens: [],
    passkeys: [],
  },
};

export const DarkShell: Story = {
  globals: { theme: "dark" },
  args: defaultArgs,
};

/** UserButton opens Account in a modal — typical product wiring. */
export const WithUserButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative min-h-screen bg-[#f5f5f7] p-10 dark:bg-zinc-950">
        <div className="flex justify-end">
          <UserButton
            user={demoUser}
            onManageAccount={() => setOpen(true)}
            onSignOut={() => console.log("sign out")}
          />
        </div>
        {open ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="h-[min(640px,100%)] w-[min(960px,100%)] overflow-hidden rounded-2xl bg-background text-foreground shadow-2xl">
              <Account
                {...defaultArgs}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Click the avatar → Manage account
          </p>
        )}
      </div>
    );
  },
};

/** The hosted `/account` identity screen — same preview embedded on authdog.com. */
export const Hosted: Story = {
  args: defaultArgs,
  parameters: { layout: "centered" },
  render: () => (
    <HostedPreview route="account" extra="&demo=true" title="<UserProfile />" />
  ),
};
