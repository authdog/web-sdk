"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { ThemeToggle } from "../../components/ui/theme-toggle";

const meta = {
  title: "UI/Theme Toggle",
  component: ThemeToggle,
  tags: ["autodocs"],
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Basic: Story = {};
