"use client";

import type { Meta, StoryObj } from "@storybook/react";

import { PlaceholderAlert } from "../../components/core/placeholder-alert";
import React from "react";

const meta = {
  title: "Core/Placeholder Alert",
  component: PlaceholderAlert,
  tags: ["autodocs"],
} satisfies Meta<typeof PlaceholderAlert>;

export default meta;

type Story = StoryObj<typeof PlaceholderAlert>;

export const Basic: Story = {
  args: {
    title: "Custom Alert Title",
    description: "This is a custom description for the placeholder alert.",
  },
};
