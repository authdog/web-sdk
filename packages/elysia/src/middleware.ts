import {
  fetchUserData,
  isAuthenticatedUserInfo,
  type PublicKeyPayload,
} from "@authdog/node-commons";
import { Elysia } from "elysia";
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
export const resolveContext = async (
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
 * Builds the `attachSession` plugin. It never throws and never short-circuits
 * the request: it resolves the session (if any) and injects an `authdog`
 * property into the handler context (globally, so every downstream route and
 * `requireAuth` can read it), leaving the decision of what to do with an
 * unauthenticated request to `requireAuth` or your route handlers.
 *
 * When `fetchUser` is enabled (the default) it calls the identity provider's
 * `userinfo` endpoint and only marks the request authenticated when the
 * envelope reports success (`isAuthenticatedUserInfo`). Any network or parse
 * failure degrades to an unauthenticated context rather than a 500.
 */
export const createAttachSession = (
  payload: PublicKeyPayload,
  options: AttachSessionOptions = {},
) => {
  const fetchUser = options.fetchUser ?? true;

  return new Elysia({ name: "@authdog/elysia" }).derive(
    { as: "global" },
    async ({ request }): Promise<{ authdog: AuthdogRequestContext }> => ({
      authdog: await resolveContext(payload, getSessionToken(request), fetchUser),
    }),
  );
};

/**
 * Enforcement helper for use as an Elysia `beforeHandle` hook. Responds with
 * `401` JSON when the request has no valid Authdog session and returns nothing
 * (letting the handler run) otherwise.
 *
 * ```ts
 * app.get("/me", ({ authdog }) => authdog.user, { beforeHandle: requireAuth });
 * ```
 *
 * ⚠️ This is the real server-side enforcement point. Client-side checks are
 * presentational only; every protected route MUST sit behind `requireAuth`
 * (after `attachSession` has been applied) for the protection to be real.
 */
export const requireAuth = (context: {
  authdog?: AuthdogRequestContext;
  set: { status?: number | string };
}): { error: string } | undefined => {
  if (!context.authdog?.isAuthenticated) {
    context.set.status = 401;
    return { error: "Unauthorized" };
  }
  return undefined;
};
