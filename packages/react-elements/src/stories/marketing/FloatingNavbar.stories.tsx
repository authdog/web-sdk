"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { FloatingNavbar } from "../../components/marketing/floating-navbar";
import { GlassyCtaButton } from "../../components/marketing/glassy-cta-button";
import { ThemeToggle } from "../../components/ui/theme-toggle";

const meta = {
  title: "Marketing/Floating Navbar",
  component: FloatingNavbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FloatingNavbar>;

export default meta;

type Story = StoryObj<typeof FloatingNavbar>;

const links = [
  { label: "Product", href: "#product" },
  { label: "Developers", href: "#developers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export const Default: Story = {
  render: () => (
    <div className="hero-grid-background min-h-[420px] bg-white dark:bg-[#0f1123]">
      <FloatingNavbar
        logo={<span className="text-sm font-semibold">Authdog</span>}
        links={links}
        actions={
          <>
            <ThemeToggle />
            <GlassyCtaButton className="min-h-9 px-4 py-1.5 text-sm sm:min-h-9 sm:px-4 sm:text-sm">
              Sign in
            </GlassyCtaButton>
          </>
        }
      />
      <div className="mx-auto max-w-2xl px-4 pt-24 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Scroll area beneath the sticky glassy pill nav.
        </p>
      </div>
    </div>
  ),
};
