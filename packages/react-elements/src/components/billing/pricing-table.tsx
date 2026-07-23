"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import type { BillingPlan, BillingPlanPeriod } from "./types";
import { formatAmount } from "./types";

export interface PricingTableProps {
  plans: BillingPlan[];
  loading?: boolean;
  /** The id of the caller's current plan, if any — renders "Current plan". */
  currentPlanId?: string | null;
  /** Controlled monthly/annual toggle. Omit `onPlanPeriodChange` to hide it. */
  planPeriod?: BillingPlanPeriod;
  onPlanPeriodChange?: (period: BillingPlanPeriod) => void;
  /** Plan id to badge as "Popular". */
  highlightedPlanId?: string;
  /** Hide the feature list, showing only price + CTA. */
  collapseFeatures?: boolean;
  ctaPosition?: "top" | "bottom";
  /** Called when a plan's CTA is clicked (ignored for the current plan). */
  onSelectPlan: (plan: BillingPlan, period: BillingPlanPeriod) => void;
  /** Override the CTA entirely, e.g. to embed a `CheckoutButton`. */
  renderCta?: (plan: BillingPlan, period: BillingPlanPeriod) => React.ReactNode;
  className?: string;
}

export function PricingTable({
  plans,
  loading = false,
  currentPlanId = null,
  planPeriod,
  onPlanPeriodChange,
  highlightedPlanId,
  collapseFeatures = false,
  ctaPosition = "bottom",
  onSelectPlan,
  renderCta,
  className,
}: PricingTableProps) {
  const [internalPeriod, setInternalPeriod] =
    React.useState<BillingPlanPeriod>("month");
  const period = planPeriod ?? internalPeriod;
  const setPeriod = onPlanPeriodChange ?? setInternalPeriod;

  const hasAnnual = plans.some((p) => Boolean(p.amountAnnual));

  if (loading) {
    return (
      <div className={cn("flex flex-wrap gap-4", className)}>
        {[0, 1, 2].map((i) => (
          <Card key={i} className="w-64 animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-2 h-6 w-16 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {hasAnnual && (
        <div className="flex items-center justify-center gap-1 self-center rounded-lg border p-1">
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

      <div className="flex flex-wrap items-stretch gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isHighlighted = highlightedPlanId === plan.id;
          const amount =
            period === "annual" && plan.amountAnnual
              ? plan.amountAnnual
              : plan.amountMonth;
          const cta = renderCta ? (
            renderCta(plan, period)
          ) : (
            <Button
              className="w-full"
              disabled={isCurrent}
              variant={isHighlighted ? "default" : "outline"}
              onClick={() => onSelectPlan(plan, period)}
            >
              {isCurrent ? "Current plan" : `Choose ${plan.name}`}
            </Button>
          );

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex w-64 flex-col",
                isHighlighted && "border-primary shadow-md",
              )}
            >
              <CardHeader>
                {isHighlighted && (
                  <Badge className="w-fit" variant="default">
                    Popular
                  </Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                {plan.description && (
                  <CardDescription>{plan.description}</CardDescription>
                )}
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">
                    {formatAmount(amount, plan.currency)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{period === "annual" ? "year" : "month"}
                  </span>
                </div>
                {ctaPosition === "top" && <div className="pt-2">{cta}</div>}
              </CardHeader>

              {!collapseFeatures && plan.features && plan.features.length > 0 && (
                <CardContent className="flex-1">
                  <ul className="flex flex-col gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}

              {ctaPosition === "bottom" && <CardFooter>{cta}</CardFooter>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
