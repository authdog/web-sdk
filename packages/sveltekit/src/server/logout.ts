import { sanitizeRedirectPath } from "@authdog/node-commons";

import { DEFAULT_SESSION_COOKIE } from "./cookies";

export const logoutHandler = async (
  request: Request,
  cookieName: string = DEFAULT_SESSION_COOKIE,
): Promise<Response> => {
  // Clear the session cookie
  const response = new Response(null, { status: 302 });

  // Set cookie to expire immediately. Secure is gated on production so local
  // HTTP development still clears the cookie; HttpOnly + SameSite=Lax retained.
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  response.headers.set(
    "Set-Cookie",
    `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${secure} SameSite=Lax`,
  );

  // Redirect to home page or specified redirect URL. Sanitize to prevent
  // open-redirect via an attacker-controlled redirect_uri parameter.
  const url = new URL(request.url);
  const redirectUrl = sanitizeRedirectPath(
    url.searchParams.get("redirect_uri"),
    "/",
  );

  response.headers.set("Location", redirectUrl);

  return response;
};
