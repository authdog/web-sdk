import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Responsive grid wrapper for BentoCard tiles, matching the marketing
 * "Security" feature section.
 */
function BentoGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="bento-grid"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-fr", className)}
      {...props}
    />
  );
}

/**
 * Feature tile with the marketing hover treatment: soft translucent border at
 * rest, brand-purple border + glow shadow and a slight lift on hover.
 */
function BentoCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="bento-card"
      className={cn(
        "group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl p-6",
        "border border-gray-200/80 bg-white",
        "dark:border-white/10 dark:bg-[#14162b]/60 dark:backdrop-blur-sm",
        "transition-[border-color,box-shadow,transform] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-[#6c47ff]/40 hover:shadow-[0_12px_40px_-12px_rgba(108,71,255,0.35)]",
        "dark:hover:border-[#8f6dff]/40 dark:hover:shadow-[0_18px_60px_-18px_rgba(143,109,255,0.45)]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(108,71,255,0.10), transparent 60%)",
        }}
      />
      <div className="relative flex h-full flex-col gap-5">{children}</div>
    </div>
  );
}

function BentoCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="bento-card-title"
      className={cn(
        "text-lg font-semibold tracking-tight text-gray-900 dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function BentoCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="bento-card-description"
      className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
      {...props}
    />
  );
}

export { BentoGrid, BentoCard, BentoCardTitle, BentoCardDescription };
