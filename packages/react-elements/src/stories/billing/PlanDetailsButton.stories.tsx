"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { PlanDetailsButton } from "../../components/billing/plan-details-button";
import type { BillingPlan } from "../../components/billing/types";

const PLAN: BillingPlan = {
  id: "plan_pro",
  slug: "pro",
  name: "Pro",
  description: "For growing teams.",
  currency: "usd",
  amountMonth: 2900,
  amountAnnual: 29000,
  features: [
    { id: "f1", slug: "basic_auth", name: "Basic authentication" },
    { id: "f3", slug: "sso", name: "Single sign-on" },
    { id: "f4", slug: "priority_support", name: "Priority support" },
  ],
};

const meta = {
  title: "Billing/PlanDetailsButton",
  component: PlanDetailsButton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlanDetailsButton>;

export default meta;

type Story = StoryObj<typeof PlanDetailsButton>;

export const Basic: Story = {
  args: {
    plan: PLAN,
    publishableKey: "pk_test_mock",
    onCreateSubscription: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { clientSecret: null };
    },
  },
};
