import * as React from "react";

import { cn } from "../../lib/utils";

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Accent color scheme for the label. */
  tone?: "brand" | "impact" | "muted";
}

const tones: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  brand: "text-indigo-500/90 dark:text-indigo-300/80",
  impact: "text-[#d5522d] dark:text-[#ff9675]",
  muted: "text-gray-500 dark:text-gray-400",
};

/**
 * Monospace uppercase section label, as used above every heading on the
 * marketing landing page.
 */
function Eyebrow({ className, tone = "brand", ...props }: EyebrowProps) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        "font-mono text-xs font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export { Eyebrow };
