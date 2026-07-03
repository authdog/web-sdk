import {
  fetchUserData,
  isAuthenticatedUserInfo,
  type UserInfoResponse,
} from "@authdog/node-commons";

import { getPublicKeyPayload } from "../commons";
import { DEFAULT_SESSION_COOKIE, getSessionToken } from "./cookies";
import { logoutHandler } from "./logout";
import type {
  AuthdogConfig,
  AuthdogRequestContext,
  LambdaEvent,
  LambdaHandler,
  LambdaResult,
} from "./types";

/** The instance returned by {@link createAuthdog}. */
export interface AuthdogApi {
  /** Reads the raw session token from the event, or null. */
  getSession: (event: LambdaEvent) => string | null;
  /**
   * Resolves the authenticated user from the identity host's userinfo endpoint,
   * or null when there is no valid session. A network / parse failure degrades
   * to null rather than throwing.
   */
  getUser: (event: LambdaEvent) => Promise<UserInfoResponse | null>;
  /**
   * Higher-order wrapper that gates a RedwoodJS API function behind
   * authentication. Returns a `401` result when there is no valid session;
   * otherwise attaches the resolved context to `event.authdog` and calls your
   * handler.
   *
   * ⚠️ This is the real server-side enforcement point — client-side checks are
   * presentational only.
   */
  requireAuth: (handler: LambdaHandler) => LambdaHandler;
  /** Clears the session cookie and returns a redirect result (see {@link logoutHandler}). */
  logout: (event: LambdaEvent, context?: unknown) => LambdaResult;
  /** Returns the validated public-key payload as a JSON string. */
  getPublicKey: () => string;
}

/**
 * Creates an Authdog helper for the RedwoodJS API side.
 *
 * The public key is validated and parsed once here — enforcing the trusted
 * identity-host allowlist (SSRF / token-exfiltration protection) — so a
 * malformed or untrusted key fails fast at construction rather than per request.
 *
 * ```ts
 * // api/src/functions/me.ts
 * import { createAuthdog } from "@authdog/redwood/api";
 *
 * const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });
 *
 * export const handler = authdog.requireAuth(async (event) => ({
 *   statusCode: 200,
 *   body: JSON.stringify(event.authdog.user),
 * }));
 * ```
 */
export const createAuthdog = (config: AuthdogConfig): AuthdogApi => {
  if (!config.publicKey) {
    throw new Error("Public key is not defined");
  }

  const cookieName = config.cookieName ?? DEFAULT_SESSION_COOKIE;
  // Validate + parse eagerly so an invalid/untrusted key throws at startup.
  const payload = getPublicKeyPayload(config.publicKey);

  const resolveContext = async (
    event: LambdaEvent,
  ): Promise<AuthdogRequestContext> => {
    const token = getSessionToken(event, cookieName);
    if (!token) {
      return {
        token: null,
        user: null,
        isAuthenticated: false,
        userInfo: null,
      };
    }

    try {
      const userInfo = await fetchUserData(
        payload.identityHost,
        payload.environmentId,
        token,
      );
      const authenticated = isAuthenticatedUserInfo(userInfo);
      return {
        token,
        user: authenticated ? (userInfo.user ?? null) : null,
        isAuthenticated: authenticated,
        userInfo,
      };
    } catch {
      // A failed or untrusted userinfo lookup is treated as "not authenticated"
      // — never as a server error and never as an authenticated session.
      return { token, user: null, isAuthenticated: false, userInfo: null };
    }
  };

  return {
    getSession: (event) => getSessionToken(event, cookieName),

    getUser: async (event) => {
      const ctx = await resolveContext(event);
      return ctx.isAuthenticated ? (ctx.userInfo ?? null) : null;
    },

    requireAuth: (handler) => async (event, context) => {
      const ctx = await resolveContext(event);
      if (!ctx.isAuthenticated) {
        return {
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Unauthorized" }),
        };
      }
      event.authdog = ctx;
      return handler(event, context);
    },

    logout: (event, context) => logoutHandler(event, context, cookieName),

    getPublicKey: () => JSON.stringify(payload),
  };
};
