"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { PricingTable } from "../../components/billing/pricing-table";
import type { BillingPlan } from "../../components/billing/types";

const PLANS: BillingPlan[] = [
  {
    id: "plan_free",
    slug: "free",
    name: "Free",
    description: "For trying things out.",
    currency: "usd",
    amountMonth: 0,
    features: [
      { id: "f1", slug: "basic_auth", name: "Basic authentication" },
      { id: "f2", slug: "community_support", name: "Community support" },
    ],
  },
  {
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
  },
  {
    id: "plan_enterprise",
    slug: "enterprise",
    name: "Enterprise",
    description: "For large organizations.",
    currency: "usd",
    amountMonth: 9900,
    amountAnnual: 99000,
    features: [
      { id: "f1", slug: "basic_auth", name: "Basic authentication" },
      { id: "f3", slug: "sso", name: "Single sign-on" },
      { id: "f5", slug: "sla", name: "Dedicated SLA" },
      { id: "f6", slug: "audit_logs", name: "Advanced audit logs" },
    ],
  },
];

const meta = {
  title: "Billing/PricingTable",
  component: PricingTable,
  tags: ["autodocs"],
} satisfies Meta<typeof PricingTable>;

export default meta;

type Story = StoryObj<typeof PricingTable>;

export const Basic: Story = {
  args: {
    plans: PLANS,
    onSelectPlan: (plan, period) => console.log("select", plan.slug, period),
  },
};

export const WithCurrentPlanAndHighlight: Story = {
  args: {
    plans: PLANS,
    currentPlanId: "plan_free",
    highlightedPlanId: "plan_pro",
    onSelectPlan: (plan, period) => console.log("select", plan.slug, period),
  },
};

export const Loading: Story = {
  args: {
    plans: [],
    loading: true,
    onSelectPlan: () => {},
  },
};

export const CollapsedFeatures: Story = {
  args: {
    plans: PLANS,
    collapseFeatures: true,
    ctaPosition: "top",
    onSelectPlan: (plan, period) => console.log("select", plan.slug, period),
  },
};
