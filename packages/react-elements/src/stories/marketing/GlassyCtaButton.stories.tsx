"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight } from "lucide-react";
import React from "react";

import { GlassyCtaButton } from "../../components/marketing/glassy-cta-button";

const meta = {
  title: "Marketing/Glassy CTA Button",
  component: GlassyCtaButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
  },
} satisfies Meta<typeof GlassyCtaButton>;

export default meta;

type Story = StoryObj<typeof GlassyCtaButton>;

export const Primary: Story = {
  render: () => (
    <GlassyCtaButton>
      Start building
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </GlassyCtaButton>
  ),
};

export const Secondary: Story = {
  render: () => (
    <GlassyCtaButton variant="secondary">Read the docs</GlassyCtaButton>
  ),
};

export const HeroPair: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <GlassyCtaButton className="w-full sm:w-auto">
        Start building
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </GlassyCtaButton>
      <GlassyCtaButton variant="secondary" className="w-full sm:w-auto">
        Talk to us
      </GlassyCtaButton>
    </div>
  ),
};
