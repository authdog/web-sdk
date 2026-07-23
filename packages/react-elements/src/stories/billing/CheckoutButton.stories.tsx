"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { CheckoutButton } from "../../components/billing/checkout-button";
import type { BillingPlan } from "../../components/billing/types";

const PLAN: BillingPlan = {
  id: "plan_pro",
  slug: "pro",
  name: "Pro",
  description: "For growing teams.",
  currency: "usd",
  amountMonth: 2900,
  amountAnnual: 29000,
};

const meta = {
  title: "Billing/CheckoutButton",
  component: CheckoutButton,
  tags: ["autodocs"],
} satisfies Meta<typeof CheckoutButton>;

export default meta;

type Story = StoryObj<typeof CheckoutButton>;

// Storybook has no real Stripe/backend connection, so `onCreateSubscription`
// intentionally resolves with no client secret — this demonstrates the
// drawer's loading + error states without attempting a real Stripe.js call.
export const Basic: Story = {
  args: {
    plan: PLAN,
    planPeriod: "month",
    publishableKey: "pk_test_mock",
    onCreateSubscription: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { clientSecret: null };
    },
  },
};
