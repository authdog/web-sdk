import { sanitizeRedirectPath } from "@authdog/node-commons";
import { DEFAULT_SESSION_COOKIE } from "./cookies";
import type { LambdaEvent, LambdaResult } from "./types";

/**
 * RedwoodJS API function that clears the Authdog session cookie and redirects to
 * a safe, same-origin location.
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
 * // api/src/functions/logout.ts
 * export { logoutHandler as handler } from "@authdog/redwood/api";
 * ```
 */
export const logoutHandler = (
  event: LambdaEvent,
  _context?: unknown,
  cookieName: string = DEFAULT_SESSION_COOKIE,
): LambdaResult => {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";

  const redirectUrl = sanitizeRedirectPath(
    event.queryStringParameters?.redirect_uri,
    "/",
  );

  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${secure} SameSite=Lax`,
      Location: redirectUrl,
    },
    body: "",
  };
};
