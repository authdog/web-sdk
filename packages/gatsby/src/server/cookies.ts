import { parseCookies } from "@authdog/node-commons";
import type { GatsbyFunctionRequest } from "./types";

/** Default name of the cookie that carries the Authdog session token. */
export const DEFAULT_SESSION_COOKIE = "authdog-session";

const headerValue = (
  headers: GatsbyFunctionRequest["headers"],
  name: string,
): string | null => {
  const value = headers[name];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

/**
 * Extracts the session token from a Gatsby Functions request. The token may
 * arrive either as an `Authorization: Bearer <token>` header (API / mobile
 * callers) or as the session cookie (set server-side, HttpOnly).
 *
 * Cookies are read from Gatsby's pre-parsed `req.cookies` when present, falling
 * back to parsing the raw `Cookie` header via `parseCookies`, which splits on
 * the first `=` and URL-decodes values — correctly handling tokens that contain
 * `=` (e.g. base64 / JWT padding).
 */
export const getSessionToken = (
  req: GatsbyFunctionRequest,
  cookieName: string = DEFAULT_SESSION_COOKIE,
): string | null => {
  const authHeader = headerValue(req.headers, "authorization");
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      return token;
    }
  }

  const preParsed = req.cookies?.[cookieName];
  if (preParsed) {
    return preParsed;
  }

  const cookieHeader = headerValue(req.headers, "cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  return cookies.find((c) => c.name === cookieName)?.value ?? null;
};
