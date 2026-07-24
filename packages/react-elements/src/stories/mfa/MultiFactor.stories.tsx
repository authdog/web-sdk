"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { TOTPValidator } from "../../components/flow/totp-validator";
import { HostedPreview } from "../_hosted";

const meta = {
  title: "MFA/MultiFactor",
  component: TOTPValidator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<MultiFactor />` — TOTP challenge step. The `TOTPValidator` export renders the code-entry form in your app; the hosted `/totp` identity screen provides the same step in the hosted flow.",
      },
    },
  },
} satisfies Meta<typeof TOTPValidator>;

export default meta;

type Story = StoryObj<typeof TOTPValidator>;

export const Default: Story = {
  args: {
    onValidate: async (code: string) => {
      console.log("TOTP submitted", code);
    },
  },
};

/** The hosted `/totp` identity screen — same preview embedded on authdog.com. */
export const Hosted: Story = {
  args: {
    onValidate: async () => {},
  },
  parameters: { layout: "centered" },
  render: () => <HostedPreview route="totp" title="<MultiFactor />" />,
};
