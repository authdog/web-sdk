"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof Label>;

export const Basic: Story = {
  args: {
    children: "Email address",
  },
};

export const WithInput: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Label {...args} htmlFor="email">
        Email address
      </Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="group flex flex-col gap-2" data-disabled="true">
      <Label {...args} htmlFor="email-disabled">
        Email address
      </Label>
      <Input id="email-disabled" type="email" disabled />
    </div>
  ),
};
