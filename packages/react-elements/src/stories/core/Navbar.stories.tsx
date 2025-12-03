"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { Navbar } from "../../components/core/navbar";
import React from "react";

const demoItems = [
  { title: "Home", href: "/" },
  { title: "Features", href: "/features" },
  { title: "Pricing", href: "/pricing" },
  { title: "Contact", href: "/contact" },
];

const demoUser = {
  id: "user_123",
  displayName: "Avery Stone",
  emails: [{ value: "avery.stone@example.com" }],
  photos: [{ value: "https://i.pravatar.cc/120?img=56" }],
};

const meta = {
  title: "Core/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    logoText: "Authdog",
    items: demoItems,
  },
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Guest: Story = {};

export const Authenticated: Story = {
  args: {
    user: demoUser,
  },
};


