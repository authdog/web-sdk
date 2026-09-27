"use client";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar className="h-12 w-12 border">
      <AvatarImage src="https://i.pravatar.cc/120?u=avatar" alt="User" />
      <AvatarFallback>DB</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar className="h-12 w-12 border">
      <AvatarFallback>DB</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      {[8, 10, 12, 16].map((size) => (
        <Avatar key={size} className={`h-${size} w-${size} border`}>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
