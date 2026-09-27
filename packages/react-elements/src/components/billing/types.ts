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
  forResource?: "user" | "org";
  currency: string;
  amountMonth: number;
  amountAnnual?: number | null;
  isDefault?: boolean;
  features?: BillingFeature[];
}

export interface BillingSubscription {
  id: string;
  planId: string | null;
  planPeriod: "month" | "annual";
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export type BillingPlanPeriod = "month" | "annual";

/** Formats integer cents as a locale-aware currency string, e.g. 1200 -> "$12". */
export function formatAmount(
  amountCents: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
      ...options,
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}
