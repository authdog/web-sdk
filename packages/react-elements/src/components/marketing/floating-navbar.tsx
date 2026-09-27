"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export interface FloatingNavbarLink {
  label: string;
  href: string;
}

export interface FloatingNavbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Brand slot rendered at the left edge (logo, wordmark). */
  logo?: React.ReactNode;
  links?: FloatingNavbarLink[];
  /** Action slot rendered at the right edge (theme toggle, sign-in button). */
  actions?: React.ReactNode;
  /** Sticky positioning wrapper; disable when embedding in constrained demos. */
  sticky?: boolean;
}

/**
 * Floating glassy pill navigation bar from the marketing landing page.
 */
function FloatingNavbar({
  className,
  logo,
  links = [],
  actions,
  sticky = true,
  ...props
}: FloatingNavbarProps) {
  return (
    <div
      data-slot="floating-navbar"
      className={cn(
        "inset-x-0 z-50 mx-auto w-[95%] max-w-5xl px-4 md:px-0",
        sticky && "sticky top-4 mt-4",
        className,
      )}
      {...props}
    >
      <div className="relative flex items-center justify-between rounded-full border border-neutral-200 bg-white/70 px-1.5 py-1.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0f1123]/70">
        <div className="flex items-center gap-1 pl-2.5">{logo}</div>
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100/50 hover:text-black dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 pr-1">{actions}</div>
      </div>
    </div>
  );
}

export { FloatingNavbar };
