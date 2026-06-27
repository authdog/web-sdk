import type { APIContext, MiddlewareNext } from "astro";

import { DEFAULT_SESSION_COOKIE, getSessionCookie } from "./cookies";

export interface AuthdogMiddlewareConfig {
  publicKey: string;
  /** Cookie name holding the session token. Defaults to `authdog-session`. */
  cookieName?: string;
}

/**
 * Shape attached to `Astro.locals.authdog` by {@link authdogMiddleware}.
 *
 * Augment Astro's `App.Locals` in your project to get typed access:
 *
 * ```ts
 * // src/env.d.ts
 * declare namespace App {
 *   interface Locals {
 *     authdog: import("@authdog/astro/server").AuthdogLocals;
 *   }
 * }
 * ```
 */
export interface AuthdogLocals {
  /** Raw session token from the cookie, or null when unauthenticated. */
  session: string | null;
  /** True when a session cookie is present on the request. */
  isAuthenticated: boolean;
}

/**
 * Builds an Astro middleware handler that reads the Authdog session cookie and
 * exposes it on `context.locals.authdog` for every request.
 *
 * Wire it up in `src/middleware.ts`:
 *
 * ```ts
 * import { defineMiddleware } from "astro:middleware";
 * import { authdogMiddleware } from "@authdog/astro/server";
 *
 * export const onRequest = defineMiddleware(
 *   authdogMiddleware({ publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY }),
 * );
 * ```
 */
export const authdogMiddleware = (config: AuthdogMiddlewareConfig) => {
  const { cookieName = DEFAULT_SESSION_COOKIE } = config;

  return async (context: APIContext, next: MiddlewareNext) => {
    const session = await getSessionCookie(context.request, cookieName);

    // Cast rather than rely on a global `App.Locals` augmentation so the
    // package never forces its shape onto consumers; apps opt in by augmenting
    // `App.Locals` with `AuthdogLocals` (see the interface docs above).
    (context.locals as { authdog?: AuthdogLocals }).authdog = {
      session,
      isAuthenticated: session !== null,
    };

    return next();
  };
};
