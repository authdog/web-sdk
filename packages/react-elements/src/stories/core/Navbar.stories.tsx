"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { Navbar } from "../../components/core/navbar";
import React from "react";

const demoItems = [
  { title: "Home", href: "/" },
  { title: "Features", href: "/features" },
  { title: "Pricing", href: "/pricing" },
  // { title: "Contact", href: "/contact" },
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

export const LoadingThenAuthenticated: Story = {
  render: (args) => {
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<any | undefined>(undefined);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setUser(demoUser);
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }, []);

    return <Navbar {...args} isLoading={loading} user={user} />;
  },
  args: {
    user: undefined,
    isLoading: true,
  },
};

export const LoadingThenGuest: Story = {
  render: (args) => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }, []);

    return <Navbar {...args} isLoading={loading} />;
  },
  args: {
    user: undefined,
    isLoading: true,
  },
};

export const WithLogo: Story = {
  args: {
    logoSrc: "https://dummyimage.com/64x64/111827/ffffff&text=AD",
  },
};
