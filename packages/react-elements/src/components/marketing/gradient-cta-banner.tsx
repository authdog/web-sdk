import * as React from "react";

import { cn } from "../../lib/utils";

export interface GradientCtaBannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * Bottom-of-page CTA banner from the marketing landing page: deep-blue
 * gradient card wrapped in an animated conic-gradient border beam, with
 * blurred blob accents.
 */
function GradientCtaBanner({
  className,
  title,
  description,
  action,
  ...props
}: GradientCtaBannerProps) {
  return (
    <div
      data-slot="gradient-cta-banner"
      className={cn(
        "relative overflow-hidden rounded-[36px] p-[3px]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_6s_linear_infinite] motion-reduce:animate-none"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(70,98,245,0.9) 60deg, rgba(34,211,238,0.8) 120deg, transparent 180deg)",
        }}
      />
      <div className="relative overflow-hidden rounded-[33px] bg-gradient-to-r from-[#05060f] via-[#0a1a5a] via-[55%] to-[#0430c8] px-8 py-14 text-center sm:px-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="text-balance text-base leading-relaxed text-blue-100/80 sm:text-lg">
              {description}
            </p>
          ) : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export { GradientCtaBanner };
