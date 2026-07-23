import { parseCookies } from "@authdog/node-commons";
import type { Context } from "koa";

/** Name of the cookie that carries the Authdog session token. */
export const SESSION_COOKIE_NAME = "authdog-session";

/**
 * Extracts the session token from an incoming request. The token may arrive
 * either as the `authdog-session` cookie (set server-side, HttpOnly) or as an
 * `Authorization: Bearer <token>` header — the latter covers API clients and
 * mobile callers that do not use cookies.
 *
 * Cookie parsing goes through `parseCookies`, which splits on the first `=` and
 * URL-decodes values, correctly handling tokens that themselves contain `=`
 * (e.g. base64 / JWT padding).
 */
export const getSessionToken = (ctx: Context): string | null => {
  // Prefer an explicit bearer token when present. Koa's `ctx.get` returns "".
  const authHeader = ctx.get("authorization");
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      return token;
    }
  }

  const cookieHeader = ctx.headers.cookie ?? null;
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  return cookies.find((cookie) => cookie.name === SESSION_COOKIE_NAME)?.value ?? null;
};
