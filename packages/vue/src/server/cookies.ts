import { parseCookies } from "@authdog/node-commons";

export const getSessionCookie = async (
  request: Request,
): Promise<string | null> => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  // parseCookies splits on the first "=" and URL-decodes values, correctly
  // handling cookie values that themselves contain "=" (e.g. base64/JWT).
  const cookies = parseCookies(cookieHeader);

  return cookies.find((c) => c.name === "authdog-session")?.value ?? null;
};
