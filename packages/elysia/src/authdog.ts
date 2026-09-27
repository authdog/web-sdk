import type { PublicKeyPayload } from "@authdog/node-commons";
import { getPublicKeyPayload } from "./commons";
import { logoutHandler } from "./logout";
import { createAttachSession, requireAuth } from "./middleware";
import type { AttachSessionOptions, AuthdogConfig } from "./types";

/** The instance returned by {@link createAuthdog}. */
export interface AuthdogServer {
  /**
   * Elysia plugin that resolves the session and injects `authdog` into every
   * downstream handler context. Apply it early (typically on the root app) with
   * `.use(authdog.attachSession())` so routes and `requireAuth` can read the
   * authentication context. Never throws or blocks the request.
   */
  attachSession: (
    options?: AttachSessionOptions,
  ) => ReturnType<typeof createAttachSession>;
  /**
   * `beforeHandle` helper that returns `401` for unauthenticated requests. This
   * is the real server-side enforcement point — attach it to any protected
   * route or guard. Requires `attachSession` to have been applied first.
   */
  requireAuth: typeof requireAuth;
  /** Handler that clears the session cookie and returns a safe redirect Response. */
  logout: typeof logoutHandler;
  /** The validated, parsed public-key payload (`environmentId`, `identityHost`, …). */
  getPublicKeyPayload: () => PublicKeyPayload;
  /** The validated public-key payload as a JSON string, e.g. to inline into HTML. */
  getPublicKey: () => string;
}

/**
 * Creates an Authdog server instance for Elysia.
 *
 * The public key is validated and parsed once here — enforcing the trusted
 * identity-host allowlist (SSRF / token-exfiltration protection) — so a
 * malformed or untrusted key fails fast at startup rather than on the first
 * request.
 *
 * ```ts
 * const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });
 *
 * new Elysia()
 *   .use(authdog.attachSession())
 *   .get("/", ({ authdog: ctx }) => ({ authenticated: ctx.isAuthenticated }))
 *   .get("/me", ({ authdog: ctx }) => ctx.user, { beforeHandle: authdog.requireAuth })
 *   .get("/logout", authdog.logout);
 * ```
 */
export const createAuthdog = (config: AuthdogConfig): AuthdogServer => {
  if (!config.publicKey) {
    throw new Error("Public key is not defined");
  }

  // Validate + parse eagerly so an invalid/untrusted key throws at startup.
  const payload = getPublicKeyPayload(config.publicKey);

  return {
    attachSession: (options?: AttachSessionOptions) =>
      createAttachSession(payload, options),
    requireAuth,
    logout: logoutHandler,
    getPublicKeyPayload: () => payload,
    getPublicKey: () => JSON.stringify(payload),
  };
};
