import { parseCookies } from "@authdog/node-commons";
import type { LambdaEvent } from "./types";

/** Default name of the cookie that carries the Authdog session token. */
export const DEFAULT_SESSION_COOKIE = "authdog-session";

/** Case-insensitive header lookup (API Gateway does not normalise casing). */
const getHeader = (
  headers: LambdaEvent["headers"],
  name: string,
): string | null => {
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) {
      return headers[key] ?? null;
    }
  }
  return null;
};

/**
 * Extracts the session token from a RedwoodJS API function event. The token may
 * arrive either as an `Authorization: Bearer <token>` header (API / mobile
 * callers) or as the session cookie (set server-side, HttpOnly).
 *
 * Cookie parsing goes through `parseCookies`, which splits on the first `=` and
 * URL-decodes values, correctly handling tokens that contain `=` (e.g. base64 /
 * JWT padding).
 */
export const getSessionToken = (
  event: LambdaEvent,
  cookieName: string = DEFAULT_SESSION_COOKIE,
): string | null => {
  const authHeader = getHeader(event.headers, "authorization");
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      return token;
    }
  }

  const cookieHeader = getHeader(event.headers, "cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  return cookies.find((c) => c.name === cookieName)?.value ?? null;
};
