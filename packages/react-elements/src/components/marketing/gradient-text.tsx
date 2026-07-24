import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Indigo-to-violet gradient text, used for the highlighted words of the
 * marketing hero headline.
 */
function GradientText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="gradient-text"
      className={cn(
        "bg-gradient-to-r from-indigo-500 via-[#7c5cff] to-violet-400 bg-clip-text text-transparent dark:from-[#b8a4ff] dark:via-[#9b82ff] dark:to-[#d4c4ff]",
        className,
      )}
      {...props}
    />
  );
}

export { GradientText };
