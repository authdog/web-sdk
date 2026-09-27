"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { UserButton } from "../../components/core/user-button";

const activeUser = {
  id: "user_personal",
  displayName: "Cameron Walker",
  email: "cameron@example.com",
  avatarUrl: "",
};

const otherAccounts = [
  {
    id: "user_work",
    displayName: "Cameron Walker",
    email: "cameron@work.com",
    avatarUrl: "https://i.pravatar.cc/100?u=work",
  },
  {
    id: "user_alt",
    displayName: "Cameron Walker",
    email: "cameron.walker@example.com",
    avatarUrl: "https://i.pravatar.cc/100?u=cameron-alt",
  },
];

const meta = {
  title: "Core/User Button",
  component: UserButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <div className="flex min-h-[420px] items-start justify-end bg-[#f5f5f7] p-10">
      <UserButton {...args} />
    </div>
  ),
} satisfies Meta<typeof UserButton>;

export default meta;

type Story = StoryObj<typeof UserButton>;

export const SingleAccount: Story = {
  args: {
    user: activeUser,
    onManageAccount: () => console.log("Manage account"),
    onSignOut: () => console.log("Sign out"),
  },
};

export const MultiAccount: Story = {
  args: {
    user: {
      ...activeUser,
      // Force initials fallback like the Clerk reference avatar
      avatarUrl: undefined,
    },
    accounts: otherAccounts,
    onManageAccount: () => console.log("Manage account"),
    onSignOut: () => console.log("Sign out"),
    onSwitchAccount: (id) => console.log("Switch account", id),
    onAddAccount: () => console.log("Add account"),
    onSignOutAll: () => console.log("Sign out of all accounts"),
  },
};

export const OpenByDefaultHint: Story = {
  name: "Multi account (click avatar)",
  args: {
    ...MultiAccount.args,
  },
};
