"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { UserDropdown } from "../../components/core/user-dropdown";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import React from "react";

const demoUser = {
  displayName: "Jane Doe",
  emails: [{ value: "jane.doe@example.com" }],
  photos: [{ value: "https://i.pravatar.cc/100" }],
};

const trigger = (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow">
    <Avatar className="h-8 w-8 rounded-full">
      <AvatarImage src="https://i.pravatar.cc/100" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  </span>
);

const meta = {
  title: "Core/User Dropdown",
  component: UserDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <div className="p-10">
      <UserDropdown {...args} />
    </div>
  ),
} satisfies Meta<typeof UserDropdown>;

export default meta;

type Story = StoryObj<typeof UserDropdown>;

export const Default: Story = {
  args: {
    trigger,
    user: demoUser,
    links: [{ label: "My Organizations", href: "/organizations" }],
    side: "bottom",
    align: "start",
    onManageAccount: () => console.log("Manage account"),
    onSignout: () => console.log("Sign out"),
  },
};
