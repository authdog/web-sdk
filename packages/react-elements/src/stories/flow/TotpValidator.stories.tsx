"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { TOTPValidator } from "../../components/flow/totp-validator";

const meta = {
  title: "Flows/TOTP Validator",
  component: TOTPValidator,
  tags: ["autodocs"],
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


