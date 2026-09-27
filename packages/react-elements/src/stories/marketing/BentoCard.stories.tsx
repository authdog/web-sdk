"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { Fingerprint, Lock, ShieldAlert } from "lucide-react";
import React from "react";

import {
  BentoCard,
  BentoCardDescription,
  BentoCardTitle,
  BentoGrid,
} from "../../components/marketing/bento";

const meta = {
  title: "Marketing/Bento Card",
  component: BentoCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof BentoCard>;

export default meta;

type Story = StoryObj<typeof BentoCard>;

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300">
      {children}
    </div>
  );
}

export const Single: Story = {
  render: () => (
    <div className="max-w-sm">
      <BentoCard>
        <IconChip>
          <Fingerprint className="h-5 w-5" />
        </IconChip>
        <div className="space-y-1.5">
          <BentoCardTitle>Passkeys by default</BentoCardTitle>
          <BentoCardDescription>
            Phishing-resistant sign-in with platform authenticators, with
            automatic fallback to OTP when a device cannot attest.
          </BentoCardDescription>
        </div>
      </BentoCard>
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <BentoGrid>
      <BentoCard>
        <IconChip>
          <Fingerprint className="h-5 w-5" />
        </IconChip>
        <div className="space-y-1.5">
          <BentoCardTitle>Passkeys by default</BentoCardTitle>
          <BentoCardDescription>
            Phishing-resistant sign-in with platform authenticators.
          </BentoCardDescription>
        </div>
      </BentoCard>
      <BentoCard>
        <IconChip>
          <ShieldAlert className="h-5 w-5" />
        </IconChip>
        <div className="space-y-1.5">
          <BentoCardTitle>Fraud signals</BentoCardTitle>
          <BentoCardDescription>
            Device, network, and behavior heuristics scored on every session.
          </BentoCardDescription>
        </div>
      </BentoCard>
      <BentoCard>
        <IconChip>
          <Lock className="h-5 w-5" />
        </IconChip>
        <div className="space-y-1.5">
          <BentoCardTitle>Session hardening</BentoCardTitle>
          <BentoCardDescription>
            Rotating refresh tokens, device binding, and step-up MFA prompts.
          </BentoCardDescription>
        </div>
      </BentoCard>
    </BentoGrid>
  ),
};
