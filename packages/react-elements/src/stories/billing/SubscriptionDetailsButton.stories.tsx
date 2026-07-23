"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { SubscriptionDetailsButton } from "../../components/billing/subscription-details-button";
import type {
  BillingPlan,
  BillingSubscription,
} from "../../components/billing/types";

const PLAN: BillingPlan = {
  id: "plan_pro",
  slug: "pro",
  name: "Pro",
  currency: "usd",
  amountMonth: 2900,
  amountAnnual: 29000,
};

const ACTIVE_SUBSCRIPTION: BillingSubscription = {
  id: "sub_1",
  planId: "plan_pro",
  planPeriod: "month",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  cancelAtPeriodEnd: false,
};

const CANCELING_SUBSCRIPTION: BillingSubscription = {
  ...ACTIVE_SUBSCRIPTION,
  cancelAtPeriodEnd: true,
};

const meta = {
  title: "Billing/SubscriptionDetailsButton",
  component: SubscriptionDetailsButton,
  tags: ["autodocs"],
} satisfies Meta<typeof SubscriptionDetailsButton>;

export default meta;

type Story = StoryObj<typeof SubscriptionDetailsButton>;

export const Active: Story = {
  args: {
    subscription: ACTIVE_SUBSCRIPTION,
    plan: PLAN,
    onCancelSubscription: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return true;
    },
  },
};

export const CancelingAtPeriodEnd: Story = {
  args: {
    subscription: CANCELING_SUBSCRIPTION,
    plan: PLAN,
    onCancelSubscription: async () => true,
  },
};
