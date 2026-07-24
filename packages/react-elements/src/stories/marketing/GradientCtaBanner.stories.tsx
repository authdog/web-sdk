"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { GradientCtaBanner } from "../../components/marketing/gradient-cta-banner";

const meta = {
  title: "Marketing/Gradient CTA Banner",
  component: GradientCtaBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof GradientCtaBanner>;

export default meta;

type Story = StoryObj<typeof GradientCtaBanner>;

export const Default: Story = {
  render: () => (
    <GradientCtaBanner
      title="Ship secure auth this sprint"
      description="Drop-in identity UI, hosted flows, and framework SDKs — everything you need to go from zero to production."
      action={
        <a
          href="#"
          className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-[#4662f5] px-7 text-base font-medium text-white transition-colors hover:bg-[#364de0]"
        >
          Get started for free
        </a>
      }
    />
  ),
};
