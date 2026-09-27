"use client";

import * as React from "react";
import type { Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import type { BillingPlan, BillingPlanPeriod } from "./types";
import { formatAmount } from "./types";

export interface CreateSubscriptionResult {
  clientSecret: string | null;
}

export interface CheckoutButtonProps {
  plan: BillingPlan;
  planPeriod?: BillingPlanPeriod;
  /** The environment's Stripe publishable key (from `listPlans()`). */
  publishableKey: string;
  children?: React.ReactNode;
  className?: string;
  /**
   * Creates the subscription server-side (e.g. via
   * `client.billing.createSubscription`) and returns its PaymentIntent
   * client secret for Stripe Elements to confirm.
   */
  onCreateSubscription: (
    plan: BillingPlan,
    period: BillingPlanPeriod,
  ) => Promise<CreateSubscriptionResult | null>;
  onSubscriptionComplete?: () => void;
  /** Where Stripe redirects back to after an off-session (3DS) confirmation. */
  returnUrl?: string;
}

function CheckoutForm({
  onSubscriptionComplete,
  onClose,
  returnUrl,
}: {
  onSubscriptionComplete?: () => void;
  onClose: () => void;
  returnUrl?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          returnUrl ?? (typeof window !== "undefined" ? window.location.href : ""),
      },
      redirect: "if_required",
    });

    setSubmitting(false);

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSubscriptionComplete?.();
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <SheetFooter>
        <Button onClick={handleConfirm} disabled={!stripe || submitting}>
          {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Confirm payment
        </Button>
      </SheetFooter>
    </div>
  );
}

export function CheckoutButton({
  plan,
  planPeriod = "month",
  publishableKey,
  children,
  className,
  onCreateSubscription,
  onSubscriptionComplete,
  returnUrl,
}: CheckoutButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const stripePromiseRef = React.useRef<Promise<Stripe | null> | null>(null);

  const getStripePromise = React.useCallback(() => {
    if (!stripePromiseRef.current) {
      stripePromiseRef.current = import("@stripe/stripe-js").then(({ loadStripe }) =>
        loadStripe(publishableKey),
      );
    }
    return stripePromiseRef.current;
  }, [publishableKey]);

  const handleClick = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setClientSecret(null);
    getStripePromise();

    try {
      const result = await onCreateSubscription(plan, planPeriod);
      if (!result?.clientSecret) {
        setError("Could not start checkout. Please try again.");
      } else {
        setClientSecret(result.clientSecret);
      }
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className={className} onClick={handleClick}>
        {children ?? "Checkout"}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Subscribe to {plan.name}</SheetTitle>
            <SheetDescription>
              {formatAmount(
                planPeriod === "annual" && plan.amountAnnual
                  ? plan.amountAnnual
                  : plan.amountMonth,
                plan.currency,
              )}{" "}
              / {planPeriod === "annual" ? "year" : "month"}
            </SheetDescription>
          </SheetHeader>

          <div className="px-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            {!loading && error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!loading && clientSecret && (
              <Elements
                stripe={getStripePromise()}
                options={{ clientSecret }}
              >
                <CheckoutForm
                  onSubscriptionComplete={onSubscriptionComplete}
                  onClose={() => setOpen(false)}
                  returnUrl={returnUrl}
                />
              </Elements>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
