import type { PublicKeyPayload } from "@authdog/node-commons";
import type { Context, MiddlewareHandler } from "hono";
import { getPublicKeyPayload } from "./commons";
import { logoutHandler } from "./logout";
import { createAttachSession, requireAuth } from "./middleware";
import type { AttachSessionOptions, AuthdogConfig } from "./types";

/** The instance returned by {@link createAuthdog}. */
export interface AuthdogServer {
  /**
   * Middleware that resolves the session and stores the `authdog` context
   * variable. Mount it early (typically app-wide) so downstream handlers and
   * `requireAuth` can read the authentication context. Never throws or blocks
   * the request.
   */
  attachSession: (options?: AttachSessionOptions) => MiddlewareHandler;
  /**
   * Gate middleware that returns `401` for unauthenticated requests. This is
   * the real server-side enforcement point — place it before any protected
   * route. Requires `attachSession` to have run first.
   */
  requireAuth: MiddlewareHandler;
  /** Handler that clears the session cookie and performs a safe redirect. */
  logout: (c: Context) => Response;
  /** The validated, parsed public-key payload (`environmentId`, `identityHost`, …). */
  getPublicKeyPayload: () => PublicKeyPayload;
  /** The validated public-key payload as a JSON string, e.g. to inline into HTML. */
  getPublicKey: () => string;
}

/**
 * Creates an Authdog server instance for Hono.
 *
 * The public key is validated and parsed once here — enforcing the trusted
 * identity-host allowlist (SSRF / token-exfiltration protection) — so a
 * malformed or untrusted key fails fast at startup rather than on the first
 * request.
 *
 * ```ts
 * const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });
 *
 * app.use(authdog.attachSession());
 * app.get("/me", authdog.requireAuth, (c) => c.json(c.get("authdog")!.user));
 * app.get("/logout", authdog.logout);
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
