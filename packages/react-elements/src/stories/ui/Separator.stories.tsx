"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "../../components/ui/separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-64">
      <div className="text-sm">Section one</div>
      <Separator {...args} className="my-4" />
      <div className="text-sm">Section two</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-8 items-center gap-4 text-sm">
      <span>Profile</span>
      <Separator {...args} />
      <span>Settings</span>
      <Separator {...args} />
      <span>Sign out</span>
    </div>
  ),
};
