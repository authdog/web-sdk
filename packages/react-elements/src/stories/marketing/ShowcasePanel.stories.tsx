"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Eyebrow } from "../../components/marketing/eyebrow";
import { ShowcasePanel } from "../../components/marketing/showcase-panel";

const meta = {
  title: "Marketing/Showcase Panel",
  component: ShowcasePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ShowcasePanel>;

export default meta;

type Story = StoryObj<typeof ShowcasePanel>;

export const Stats: Story = {
  render: () => (
    <ShowcasePanel>
      <div className="space-y-8">
        <div className="space-y-3">
          <Eyebrow tone="impact">Impact</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Numbers that hold up in production.
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { value: "99.99%", label: "Authentication uptime" },
            { value: "<80ms", label: "Median token verification" },
            { value: "12k+", label: "SDK downloads" },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </dt>
              <dd className="mt-1 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </ShowcasePanel>
  ),
};
