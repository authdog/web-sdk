import {
  fetchUserData,
  isAuthenticatedUserInfo,
  type PublicKeyPayload,
} from "@authdog/node-commons";
import type { NextFunction, Request, RequestHandler, Response } from "express";
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
 * Builds the `attachSession` middleware. It never throws and never short-
 * circuits the request: it resolves the session (if any) and attaches the
 * result to `req.authdog`, leaving the decision of what to do with an
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
): RequestHandler => {
  const fetchUser = options.fetchUser ?? true;

  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = getSessionToken(req);

    if (!token) {
      req.authdog = { ...ANONYMOUS };
      return next();
    }

    // Without a userinfo round-trip we cannot vouch for the token's validity,
    // so we surface the token but leave `isAuthenticated` false. Callers that
    // opt out of fetching are expected to validate the token themselves.
    if (!fetchUser) {
      req.authdog = {
        token,
        user: null,
        isAuthenticated: false,
        userInfo: null,
      };
      return next();
    }

    try {
      const userInfo = await fetchUserData(
        payload.identityHost,
        payload.environmentId,
        token,
      );

      const authenticated = isAuthenticatedUserInfo(userInfo);

      req.authdog = {
        token,
        user: authenticated ? (userInfo.user ?? null) : null,
        isAuthenticated: authenticated,
        userInfo,
      };
    } catch {
      // A failed or untrusted userinfo lookup is treated as "not authenticated"
      // — never as a server error and never as an authenticated session.
      req.authdog = { token, user: null, isAuthenticated: false, userInfo: null };
    }

    return next();
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
export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.authdog?.isAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};
