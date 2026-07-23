import {
  fetchUserData,
  isAuthenticatedUserInfo,
  type PublicKeyPayload,
} from "@authdog/node-commons";
import type { MiddlewareHandler } from "hono";
import { getSessionToken } from "./cookies";
import type { AttachSessionOptions, AuthdogRequestContext } from "./types";

/** The context attached when no usable token is present on the request. */
const ANONYMOUS: AuthdogRequestContext = {
  token: null,
  user: null,
  isAuthenticated: false,
  userInfo: null,
};

/**
 * Resolves the authentication context for a token. Never throws: a failed or
 * untrusted userinfo lookup degrades to an unauthenticated context.
 */
const resolveContext = async (
  payload: PublicKeyPayload,
  token: string | null,
  fetchUser: boolean,
): Promise<AuthdogRequestContext> => {
  if (!token) {
    return { ...ANONYMOUS };
  }

  // Without a userinfo round-trip we cannot vouch for the token's validity,
  // so we surface the token but leave `isAuthenticated` false. Callers that
  // opt out of fetching are expected to validate the token themselves.
  if (!fetchUser) {
    return { token, user: null, isAuthenticated: false, userInfo: null };
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

/**
 * Builds the `attachSession` middleware. It never throws and never short-
 * circuits the request: it resolves the session (if any) and stores the result
 * under the `authdog` context variable (`c.get("authdog")`), leaving the
 * decision of what to do with an unauthenticated request to `requireAuth` or
 * your route handlers.
 *
 * When `fetchUser` is enabled (the default) it calls the identity provider's
 * `userinfo` endpoint and only marks the request authenticated when the
 * envelope reports success (`isAuthenticatedUserInfo`). Any network or parse
 * failure degrades to an unauthenticated context rather than a 500.
 */
export const createAttachSession = (
  payload: PublicKeyPayload,
  options: AttachSessionOptions = {},
): MiddlewareHandler => {
  const fetchUser = options.fetchUser ?? true;

  return async (c, next) => {
    const token = getSessionToken(c);
    c.set("authdog", await resolveContext(payload, token, fetchUser));
    await next();
  };
};

/**
 * Gate middleware that enforces authentication. Responds with `401` JSON when
 * the request has no valid Authdog session and calls `next()` otherwise.
 *
 * ⚠️ This is the real server-side enforcement point. Client-side checks are
 * presentational only; every protected route MUST sit behind `requireAuth`
 * (after `attachSession` has run) for the protection to be real.
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  if (!c.get("authdog")?.isAuthenticated) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};
