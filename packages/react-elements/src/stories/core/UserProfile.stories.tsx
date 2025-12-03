"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { UserProfile } from "../../components/core/user-profile";

const baseUser = {
  id: "user_123",
  displayName: "Jane Doe",
  provider: "google-oauth20",
  emails: [{ id: "e1", value: "jane.primary@example.com" }],
  verifications: [],
  photos: [],
};

const meta = {
  title: "Core/User Profile",
  component: UserProfile,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => (
    <div className="bg-background p-6 text-foreground">
      <UserProfile {...args} />
    </div>
  ),
} satisfies Meta<typeof UserProfile>;

export default meta;

type Story = StoryObj<typeof UserProfile>;

export const Loaded: Story = {
  args: {
    loading: false,
    user: baseUser,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    user: baseUser,
  },
};


