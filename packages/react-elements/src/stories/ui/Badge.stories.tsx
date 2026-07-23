"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "../../components/ui/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Default" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
};

export const StatusRow: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
        Verified
      </Badge>
      <Badge variant="outline" className="rounded-full">
        Primary
      </Badge>
      <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
        MFA recommended
      </Badge>
    </div>
  ),
};
