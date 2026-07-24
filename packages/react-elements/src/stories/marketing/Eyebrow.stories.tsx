"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Eyebrow } from "../../components/marketing/eyebrow";
import { GradientText } from "../../components/marketing/gradient-text";

const meta = {
  title: "Marketing/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["brand", "impact", "muted"],
    },
  },
} satisfies Meta<typeof Eyebrow>;

export default meta;

type Story = StoryObj<typeof Eyebrow>;

export const Brand: Story = {
  args: { children: "Building blocks", tone: "brand" },
};

export const Impact: Story = {
  args: { children: "Impact", tone: "impact" },
};

export const SectionHeading: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4 text-center">
      <Eyebrow>Identity infrastructure</Eyebrow>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Authentication that feels{" "}
        <GradientText>native to your product</GradientText>
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        The monospace eyebrow, bold tracking-tight heading, and gradient
        highlight — the recurring section-header pattern of the landing page.
      </p>
    </div>
  ),
};
