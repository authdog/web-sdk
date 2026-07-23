"use client";

import * as React from "react";
import type { BillingSubscription } from "./types";

export interface BillingAccessState {
  /** The caller's current subscription, or `null`/`undefined` if none. */
  subscription?: BillingSubscription | null;
  /** Feature slugs currently granted to the caller (from the active plan). */
  activeFeatures?: string[];
}

export interface HasBillingAccessCheck {
  /** Require the active subscription's plan to match this plan id/slug. */
  plan?: string;
  /** Require this feature slug to be present in `activeFeatures`. */
  feature?: string;
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Mirrors Clerk's `has({ plan })` / `has({ feature })` — a plain boolean
 * check with no network access. Callers supply the subscription/feature
 * state they already fetched (e.g. via `client.billing.getSubscription()`).
 */
export function hasBillingAccess(
  state: BillingAccessState,
  check: HasBillingAccessCheck,
): boolean {
  if (check.feature) {
    return Boolean(state.activeFeatures?.includes(check.feature));
  }
  if (check.plan) {
    const subscription = state.subscription;
    if (!subscription) return false;
    if (!ACTIVE_STATUSES.has(subscription.status)) return false;
    return subscription.planId === check.plan;
  }
  return false;
}

export interface ProtectProps extends BillingAccessState, HasBillingAccessCheck {
  /** Rendered when the check passes. */
  children: React.ReactNode;
  /** Rendered when the check fails (defaults to nothing). */
  fallback?: React.ReactNode;
}

/**
 * Gate content by plan or feature. Pure conditional render — no network
 * calls — pass in the subscription/feature state the consuming app already
 * fetched via `client.billing.getSubscription()`.
 */
export function Protect({
  children,
  fallback = null,
  subscription,
  activeFeatures,
  plan,
  feature,
}: ProtectProps) {
  const allowed = hasBillingAccess({ subscription, activeFeatures }, { plan, feature });
  return <>{allowed ? children : fallback}</>;
}
