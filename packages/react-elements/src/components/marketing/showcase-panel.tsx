import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Large rounded showcase container used by the marketing "Built for" and
 * "Impact stats" sections — a calm gray panel that hosts tabs, stats, or
 * feature content.
 */
function ShowcasePanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="showcase-panel"
      className={cn(
        "relative min-w-0 overflow-hidden rounded-3xl border border-gray-200/80 bg-gray-50 p-5 shadow-sm dark:border-white/[0.06] dark:bg-gray-950 dark:shadow-none sm:rounded-[2rem] sm:p-10 lg:p-14",
        className,
      )}
      {...props}
    />
  );
}

export { ShowcasePanel };
