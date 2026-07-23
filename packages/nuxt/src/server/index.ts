import { parseCookies, sanitizeRedirectPath } from "@authdog/node-commons";
import { getPublicKeyPayload } from "../commons";

/** Name of the cookie that carries the Authdog session token (when set server-side). */
export const SESSION_COOKIE_NAME = "authdog-session";

/**
 * Minimal shape of an H3 event (Nuxt/Nitro server routes) or a Web `Request`,
 * enough to read the incoming `Cookie` header without depending on `h3`.
 */
export interface CookieCarrier {
  node?: { req?: { headers?: { cookie?: string } } };
  headers?: Headers | Record<string, string | undefined>;
}

const readCookieHeader = (carrier: CookieCarrier): string | null => {
  const nodeCookie = carrier.node?.req?.headers?.cookie;
  if (nodeCookie) return nodeCookie;

  const headers = carrier.headers;
  if (headers instanceof Headers) {
    return headers.get("cookie");
  }
  if (headers && typeof headers === "object") {
    return headers.cookie ?? headers.Cookie ?? null;
  }
  return null;
};

/**
 * Reads the Authdog session token from an incoming Nitro/H3 event (or Web
 * `Request`). Cookie parsing goes through `parseCookies`, which URL-decodes
 * values and correctly handles tokens containing `=`.
 */
export const getServerSession = (carrier: CookieCarrier): string | null => {
  const cookieHeader = readCookieHeader(carrier);
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  return cookies.find((c) => c.name === SESSION_COOKIE_NAME)?.value ?? null;
};

/** Returns the validated public-key payload as a JSON string. */
export const getServerSidePayloadPublicKey = (publicKey: string): string => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }
  return JSON.stringify(getPublicKeyPayload(publicKey));
};

/**
 * Builds a `302` Response that clears the Authdog session cookie and redirects
 * to a safe, same-origin location (`redirect_uri` query param, sanitized).
 * `Secure` is gated on production so local HTTP development still clears it.
 */
export const logoutResponse = (request: Request): Response => {
  const response = new Response(null, { status: 302 });

  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${secure} SameSite=Lax`,
  );

  const redirectUrl = sanitizeRedirectPath(
    new URL(request.url).searchParams.get("redirect_uri"),
    "/",
  );
  response.headers.set("Location", redirectUrl);

  return response;
};
