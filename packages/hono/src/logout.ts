import { sanitizeRedirectPath } from "@authdog/node-commons";
import type { Context } from "hono";
import { SESSION_COOKIE_NAME } from "./cookies";

/**
 * Hono handler that clears the Authdog session cookie and redirects to a safe,
 * same-origin location.
 *
 * The cookie is expired in place with the same security attributes it was set
 * with (`HttpOnly`, `SameSite=Lax`, and `Secure` in production) so browsers
 * actually drop it. `Secure` is gated on `NODE_ENV === "production"` so local
 * HTTP development still clears the cookie.
 *
 * The redirect target is taken from the `redirect_uri` query parameter and run
 * through `sanitizeRedirectPath` to prevent an open redirect via an
 * attacker-controlled value (falls back to `/`).
 */
export const logoutHandler = (c: Context): Response => {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";

  c.header(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${secure} SameSite=Lax`,
  );

  const redirectUrl = sanitizeRedirectPath(c.req.query("redirect_uri"), "/");

  return c.redirect(redirectUrl, 302);
};
