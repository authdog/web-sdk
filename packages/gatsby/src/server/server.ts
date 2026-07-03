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
  GatsbyFunctionRequest,
  GatsbyFunctionResponse,
} from "./types";

/** A Gatsby Functions handler. */
export type GatsbyFunction = (
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse,
) => unknown | Promise<unknown>;

/** The instance returned by {@link createAuthdog}. */
export interface AuthdogServer {
  /** Reads the raw session token from the request, or null. */
  getSession: (req: GatsbyFunctionRequest) => string | null;
  /**
   * Resolves the authenticated user from the identity host's userinfo endpoint,
   * or null when there is no valid session. A network / parse failure degrades
   * to null rather than throwing.
   */
  getUser: (req: GatsbyFunctionRequest) => Promise<UserInfoResponse | null>;
  /**
   * Higher-order wrapper that gates a Gatsby Function behind authentication.
   * Responds with `401` when there is no valid session; otherwise attaches the
   * resolved context to `req.authdog` and calls your handler.
   *
   * ⚠️ This is the real server-side enforcement point — client-side checks are
   * presentational only.
   */
  requireAuth: (handler: GatsbyFunction) => GatsbyFunction;
  /** Clears the session cookie and redirects (see {@link logoutHandler}). */
  logout: (req: GatsbyFunctionRequest, res: GatsbyFunctionResponse) => void;
  /** Returns the validated public-key payload as a JSON string. */
  getPublicKey: () => string;
}

/**
 * Creates an Authdog server helper for Gatsby Functions.
 *
 * The public key is validated and parsed once here — enforcing the trusted
 * identity-host allowlist (SSRF / token-exfiltration protection) — so a
 * malformed or untrusted key fails fast at construction rather than per request.
 *
 * ```ts
 * // src/api/me.ts
 * import { createAuthdog } from "@authdog/gatsby/server";
 *
 * const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });
 *
 * export default authdog.requireAuth(async (req, res) => {
 *   res.json(req.authdog.user);
 * });
 * ```
 */
export const createAuthdog = (config: AuthdogConfig): AuthdogServer => {
  if (!config.publicKey) {
    throw new Error("Public key is not defined");
  }

  const cookieName = config.cookieName ?? DEFAULT_SESSION_COOKIE;
  // Validate + parse eagerly so an invalid/untrusted key throws at startup.
  const payload = getPublicKeyPayload(config.publicKey);

  const resolveContext = async (
    req: GatsbyFunctionRequest,
  ): Promise<AuthdogRequestContext> => {
    const token = getSessionToken(req, cookieName);
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
    getSession: (req) => getSessionToken(req, cookieName),

    getUser: async (req) => {
      const ctx = await resolveContext(req);
      return ctx.isAuthenticated ? (ctx.userInfo ?? null) : null;
    },

    requireAuth: (handler) => async (req, res) => {
      const ctx = await resolveContext(req);
      if (!ctx.isAuthenticated) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      req.authdog = ctx;
      return handler(req, res);
    },

    logout: (req, res) => logoutHandler(req, res, cookieName),

    getPublicKey: () => JSON.stringify(payload),
  };
};
