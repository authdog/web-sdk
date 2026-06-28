import { parseCookies } from "@authdog/node-commons";

/** Default name of the cookie holding the Authdog session token. */
export const DEFAULT_SESSION_COOKIE = "authdog-session";

export const getSessionCookie = async (
  request: Request,
  cookieName: string = DEFAULT_SESSION_COOKIE,
): Promise<string | null> => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  // parseCookies splits on the first "=" and URL-decodes values, correctly
  // handling cookie values that themselves contain "=" (e.g. base64/JWT).
  const cookies = parseCookies(cookieHeader);

  return cookies.find((c) => c.name === cookieName)?.value ?? null;
};
