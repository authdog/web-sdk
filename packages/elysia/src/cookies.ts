import { parseCookies } from "@authdog/node-commons";

/** Name of the cookie that carries the Authdog session token. */
export const SESSION_COOKIE_NAME = "authdog-session";

/**
 * Extracts the session token from an incoming Web `Request`. The token may
 * arrive either as the `authdog-session` cookie (set server-side, HttpOnly) or
 * as an `Authorization: Bearer <token>` header — the latter covers API clients
 * and mobile callers that do not use cookies.
 *
 * Cookie parsing goes through `parseCookies`, which splits on the first `=` and
 * URL-decodes values, correctly handling tokens that themselves contain `=`
 * (e.g. base64 / JWT padding).
 */
export const getSessionToken = (request: Request): string | null => {
  // Prefer an explicit bearer token when present.
  const authHeader = request.headers.get("authorization");
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      return token;
    }
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  return cookies.find((cookie) => cookie.name === SESSION_COOKIE_NAME)?.value ?? null;
};
