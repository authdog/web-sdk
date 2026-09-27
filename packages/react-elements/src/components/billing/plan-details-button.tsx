"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { CheckoutButton, type CreateSubscriptionResult } from "./checkout-button";
import type { BillingPlan, BillingPlanPeriod } from "./types";
import { formatAmount } from "./types";

export interface PlanDetailsButtonProps {
  plan: BillingPlan;
  initialPlanPeriod?: BillingPlanPeriod;
  children?: React.ReactNode;
  className?: string;
  publishableKey: string;
  onCreateSubscription: (
    plan: BillingPlan,
    period: BillingPlanPeriod,
  ) => Promise<CreateSubscriptionResult | null>;
  onSubscriptionComplete?: () => void;
}

/** Opens a drawer with a plan's full price + feature details and a subscribe CTA. */
export function PlanDetailsButton({
  plan,
  initialPlanPeriod = "month",
  children,
  className,
  publishableKey,
  onCreateSubscription,
  onSubscriptionComplete,
}: PlanDetailsButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [period, setPeriod] = React.useState<BillingPlanPeriod>(initialPlanPeriod);

  return (
    <>
      <Button
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
      >
        {children ?? "Plan details"}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{plan.name}</SheetTitle>
            {plan.description && (
              <SheetDescription>{plan.description}</SheetDescription>
            )}
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            {plan.amountAnnual && (
              <div className="flex gap-1 rounded-lg border p-1 self-start">
                <Button
                  type="button"
                  size="sm"
                  variant={period === "month" ? "default" : "ghost"}
                  onClick={() => setPeriod("month")}
                >
                  Monthly
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={period === "annual" ? "default" : "ghost"}
                  onClick={() => setPeriod("annual")}
                >
                  Annual
                </Button>
              </div>
            )}

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">
                {formatAmount(
                  period === "annual" && plan.amountAnnual
                    ? plan.amountAnnual
                    : plan.amountMonth,
                  plan.currency,
                )}
              </span>
              <span className="text-muted-foreground text-sm">
                /{period === "annual" ? "year" : "month"}
              </span>
            </div>

            {plan.features && plan.features.length > 0 && (
              <ul className="flex flex-col gap-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            )}

            <CheckoutButton
              plan={plan}
              planPeriod={period}
              publishableKey={publishableKey}
              onCreateSubscription={onCreateSubscription}
              onSubscriptionComplete={() => {
                onSubscriptionComplete?.();
                setOpen(false);
              }}
            >
              Subscribe to {plan.name}
            </CheckoutButton>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
