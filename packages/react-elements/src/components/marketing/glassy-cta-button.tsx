import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const glassyCtaButtonVariants = cva(
  "group relative isolate z-0 inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-base font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(108,71,255)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-h-[3.375rem] sm:px-8 sm:text-[0.95rem]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#6c47ff] text-white shadow-[0_4px_16px_rgba(108,71,255,0.18)] hover:bg-[#5f3df0] hover:shadow-[0_6px_20px_rgba(108,71,255,0.24)] active:translate-y-0 active:shadow-sm",
        secondary:
          "border border-gray-200/90 bg-white/90 text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:border-white/15 dark:hover:bg-white/[0.07]",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface GlassyCtaButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassyCtaButtonVariants> {
  asChild?: boolean;
}

/**
 * Pill-shaped hero call-to-action button from the marketing landing page —
 * solid brand purple, or a glassy outline for the secondary action.
 */
const GlassyCtaButton = React.forwardRef<
  HTMLButtonElement,
  GlassyCtaButtonProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(glassyCtaButtonVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  );
});
GlassyCtaButton.displayName = "GlassyCtaButton";

export { GlassyCtaButton, glassyCtaButtonVariants };
