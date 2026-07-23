import { assertTrustedIdentityHost } from "./public-key";

export interface BillingFeature {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface BillingPlan {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  forResource: "user" | "org";
  currency: string;
  amountMonth: number;
  amountAnnual?: number | null;
  isDefault: boolean;
  sortOrder: number;
  features: BillingFeature[];
}

export interface BillingPlansResponse {
  plans: BillingPlan[];
  publishableKey: string | null;
  meta?: { code?: number; message?: string };
}

export interface BillingSubscription {
  id: string;
  planId: string | null;
  planPeriod: "month" | "annual";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface BillingSubscriptionResponse {
  subscription: BillingSubscription | null;
  plan: Omit<BillingPlan, "isDefault" | "sortOrder" | "features"> | null;
  meta?: { code?: number; message?: string };
}

export interface CreateBillingSubscriptionResponse {
  subscriptionId?: string;
  clientSecret: string | null;
  publishableKey: string | null;
  meta?: { code?: number; message?: string };
}

const jsonFetch = async (
  url: string,
  init: RequestInit,
): Promise<any> => {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body && body.meta && body.meta.message) ||
      `Request failed (status ${res.status})`;
    throw new Error(message);
  }
  return body;
};

/** List publicly-visible plans (+ features) for an environment. No auth required. */
export const listBillingPlans = async (
  identityHost: string,
  environmentId: string,
  options?: { for?: "user" | "org" },
): Promise<BillingPlansResponse> => {
  const safeHost = assertTrustedIdentityHost(identityHost);
  const forResource = options?.for === "org" ? "org" : "user";
  return jsonFetch(
    `${safeHost}/billing/${encodeURIComponent(environmentId)}/plans?for=${forResource}`,
    {},
  );
};

/** The authenticated caller's current subscription (v1: user-level only). */
export const getBillingSubscription = async (
  identityHost: string,
  environmentId: string,
  token: string,
): Promise<BillingSubscriptionResponse> => {
  const safeHost = assertTrustedIdentityHost(identityHost);
  return jsonFetch(
    `${safeHost}/billing/${encodeURIComponent(environmentId)}/subscription`,
    { headers: { authorization: `Bearer ${token}` } },
  );
};

/**
 * Start (or restart) a subscription for the authenticated caller. Returns a
 * Stripe PaymentIntent `clientSecret` for `CheckoutButton` to confirm via
 * Stripe Elements.
 */
export const createBillingSubscription = async (
  identityHost: string,
  environmentId: string,
  token: string,
  params: { planId: string; planPeriod?: "month" | "annual" },
): Promise<CreateBillingSubscriptionResponse> => {
  const safeHost = assertTrustedIdentityHost(identityHost);
  return jsonFetch(
    `${safeHost}/billing/${encodeURIComponent(environmentId)}/subscriptions`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        planId: params.planId,
        planPeriod: params.planPeriod ?? "month",
      }),
    },
  );
};

/** Cancel the authenticated caller's subscription at the end of the current period. */
export const cancelBillingSubscription = async (
  identityHost: string,
  environmentId: string,
  token: string,
): Promise<{ success?: boolean; meta?: { code?: number; message?: string } }> => {
  const safeHost = assertTrustedIdentityHost(identityHost);
  return jsonFetch(
    `${safeHost}/billing/${encodeURIComponent(environmentId)}/subscriptions/cancel`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    },
  );
};
