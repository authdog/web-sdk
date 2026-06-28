import type { Handle } from "@sveltejs/kit";

import { DEFAULT_SESSION_COOKIE } from "./cookies";

export interface AuthdogHandleConfig {
  publicKey: string;
  /** Cookie name holding the session token. Defaults to `authdog-session`. */
  cookieName?: string;
}

/**
 * Shape attached to `event.locals.authdog` by {@link createAuthdogHandle}.
 *
 * Augment SvelteKit's `App.Locals` in your project to get typed access:
 *
 * ```ts
 * // src/app.d.ts
 * declare global {
 *   namespace App {
 *     interface Locals {
 *       authdog: import("@authdog/sveltekit/server").AuthdogLocals;
 *     }
 *   }
 * }
 * export {};
 * ```
 */
export interface AuthdogLocals {
  /** Raw session token from the cookie, or null when unauthenticated. */
  session: string | null;
  /** True when a session cookie is present on the request. */
  isAuthenticated: boolean;
}

/**
 * Builds a SvelteKit server `handle` hook that reads the Authdog session cookie
 * and exposes it on `event.locals.authdog` for every request.
 *
 * Wire it up in `src/hooks.server.ts`:
 *
 * ```ts
 * import { createAuthdogHandle } from "@authdog/sveltekit/server";
 *
 * export const handle = createAuthdogHandle({
 *   publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
 * });
 * ```
 *
 * Compose with other hooks via `sequence` from `@sveltejs/kit/hooks`.
 */
export const createAuthdogHandle = (config: AuthdogHandleConfig): Handle => {
  const { cookieName = DEFAULT_SESSION_COOKIE } = config;

  return async ({ event, resolve }) => {
    // SvelteKit's typed cookie jar already parses and URL-decodes the header.
    const session = event.cookies.get(cookieName) ?? null;

    // Cast rather than rely on a global `App.Locals` augmentation so the
    // package never forces its shape onto consumers; apps opt in by augmenting
    // `App.Locals` with `AuthdogLocals` (see the interface docs above).
    (event.locals as { authdog?: AuthdogLocals }).authdog = {
      session,
      isAuthenticated: session !== null,
    };

    return resolve(event);
  };
};
