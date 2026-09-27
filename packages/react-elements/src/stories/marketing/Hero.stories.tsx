"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight } from "lucide-react";
import React from "react";

import { Eyebrow } from "../../components/marketing/eyebrow";
import { GlassyCtaButton } from "../../components/marketing/glassy-cta-button";
import { GradientText } from "../../components/marketing/gradient-text";

function Hero() {
  return (
    <section className="hero-grid-background relative w-full overflow-hidden bg-white pb-20 pt-24 dark:bg-[#0f1123] sm:pb-28 sm:pt-32">
      <div className="container relative z-10 mx-auto max-w-[1440px] px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Eyebrow className="mb-5 tracking-[0.2em] sm:mb-6">
            Identity for product teams
          </Eyebrow>
          <h1 className="mb-5 text-balance text-[2.125rem] font-semibold leading-[1.12] tracking-[-0.03em] text-gray-800 dark:text-gray-50 sm:mb-6 sm:text-5xl md:text-6xl">
            Authentication that feels{" "}
            <GradientText>native to your product</GradientText>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-balance text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:mb-10 sm:text-lg">
            Drop-in identity UI, hosted flows, and framework SDKs. Ship login,
            MFA, and account management without rebuilding the basics.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GlassyCtaButton className="w-full sm:w-auto">
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </GlassyCtaButton>
            <GlassyCtaButton variant="secondary" className="w-full sm:w-auto">
              Read the docs
            </GlassyCtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const meta = {
  title: "Marketing/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Hero>;

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  render: () => <Hero />,
};
