"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Protect } from "../../components/billing/protect";
import type { BillingSubscription } from "../../components/billing/types";

const meta = {
  title: "Billing/Protect",
  component: Protect,
  tags: ["autodocs"],
} satisfies Meta<typeof Protect>;

export default meta;

type Story = StoryObj<typeof Protect>;

const ACTIVE_PRO: BillingSubscription = {
  id: "sub_1",
  planId: "plan_pro",
  planPeriod: "month",
  status: "active",
};

export const PlanCheckAllowed: Story = {
  args: {
    plan: "plan_pro",
    subscription: ACTIVE_PRO,
    children: <p>You have access to Pro features.</p>,
    fallback: <p>Upgrade to Pro to unlock this.</p>,
  },
};

export const PlanCheckBlocked: Story = {
  args: {
    plan: "plan_enterprise",
    subscription: ACTIVE_PRO,
    children: <p>You have access to Enterprise features.</p>,
    fallback: <p>Upgrade to Enterprise to unlock this.</p>,
  },
};

export const FeatureCheckAllowed: Story = {
  args: {
    feature: "sso",
    activeFeatures: ["sso", "priority_support"],
    children: <p>Single sign-on is enabled.</p>,
    fallback: <p>Enable SSO on a higher plan.</p>,
  },
};
