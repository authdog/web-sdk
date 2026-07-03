import { sanitizeRedirectPath } from "@authdog/node-commons";
import { DEFAULT_SESSION_COOKIE } from "./cookies";
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "./types";

/**
 * Gatsby Functions handler that clears the Authdog session cookie and redirects
 * to a safe, same-origin location.
 *
 * The cookie is expired in place with the same security attributes it was set
 * with (`HttpOnly`, `SameSite=Lax`, and `Secure` in production) so browsers
 * actually drop it. `Secure` is gated on `NODE_ENV === "production"` so local
 * HTTP development still clears the cookie.
 *
 * The redirect target is taken from the `redirect_uri` query parameter and run
 * through `sanitizeRedirectPath` to prevent an open redirect (falls back to `/`).
 *
 * ```ts
 * // src/api/logout.ts
 * export { logoutHandler as default } from "@authdog/gatsby/server";
 * ```
 */
export const logoutHandler = (
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse,
  cookieName: string = DEFAULT_SESSION_COOKIE,
): void => {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";

  res.setHeader(
    "Set-Cookie",
    `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${secure} SameSite=Lax`,
  );

  const redirectParam = req.query?.redirect_uri;
  const redirectValue = Array.isArray(redirectParam)
    ? redirectParam[0]
    : redirectParam;
  const redirectUrl = sanitizeRedirectPath(redirectValue, "/");

  res.redirect(302, redirectUrl);
};
