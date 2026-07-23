"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import type { BillingPlan, BillingSubscription } from "./types";
import { formatAmount } from "./types";

export interface SubscriptionDetailsButtonProps {
  subscription: BillingSubscription;
  plan?: BillingPlan | null;
  children?: React.ReactNode;
  className?: string;
  onCancelSubscription: () => Promise<boolean>;
  onSubscriptionCancel?: () => void;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  canceled: "outline",
  incomplete: "outline",
};

/** Opens a drawer showing the caller's subscription status + a cancel action. */
export function SubscriptionDetailsButton({
  subscription,
  plan,
  children,
  className,
  onCancelSubscription,
  onSubscriptionCancel,
}: SubscriptionDetailsButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [canceling, setCanceling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCancel = async () => {
    setCanceling(true);
    setError(null);
    const success = await onCancelSubscription();
    setCanceling(false);
    if (success) {
      setConfirming(false);
      onSubscriptionCancel?.();
    } else {
      setError("Could not cancel subscription. Please try again.");
    }
  };

  return (
    <>
      <Button variant="outline" className={className} onClick={() => setOpen(true)}>
        {children ?? "Subscription details"}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{plan?.name ?? "Subscription"}</SheetTitle>
            <SheetDescription>Manage your subscription.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-3 px-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={STATUS_VARIANT[subscription.status] ?? "outline"}>
                {subscription.status}
              </Badge>
            </div>

            {plan && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span>
                  {formatAmount(
                    subscription.planPeriod === "annual" && plan.amountAnnual
                      ? plan.amountAnnual
                      : plan.amountMonth,
                    plan.currency,
                  )}{" "}
                  / {subscription.planPeriod === "annual" ? "year" : "month"}
                </span>
              </div>
            )}

            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {subscription.cancelAtPeriodEnd ? "Ends on" : "Renews on"}
                </span>
                <span>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            {error && <p className="text-destructive">{error}</p>}
          </div>

          {!subscription.cancelAtPeriodEnd && (
            <SheetFooter>
              {confirming ? (
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirming(false)}
                    disabled={canceling}
                  >
                    Keep subscription
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={canceling}
                  >
                    {canceling && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Confirm cancel
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" onClick={() => setConfirming(true)}>
                  Cancel subscription
                </Button>
              )}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
