import type { PublicKeyPayload } from "@authdog/node-commons";

/** Storage key under which the session token is persisted. */
export const TOKEN_STORAGE_KEY = "authdog_token";

/** JWT shape: three base64url segments separated by dots. */
export const JWT_PATTERN =
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** Whether a value looks like a JWT (and is therefore safe to persist). */
export const isJwtShaped = (value: string): boolean => JWT_PATTERN.test(value);

export interface AuthorizeUrlOptions {
  /** The app's deep-link callback (e.g. `myapp://auth/callback`). */
  redirectUri: string;
  prompt?: "signup";
}

/** Builds the OIDC `authorize` URL for a validated public-key payload. */
export const buildAuthorizeUrl = (
  payload: PublicKeyPayload,
  publicKey: string,
  options: AuthorizeUrlOptions,
): string => {
  const authUrl = new URL(
    `${payload.identityHost}/oidc/${payload.environmentId}/authorize`,
  );
  authUrl.searchParams.set("client_id", publicKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("redirect_uri", options.redirectUri);
  if (options.prompt) {
    authUrl.searchParams.set("prompt", options.prompt);
  }
  return authUrl.toString();
};

/**
 * Extracts the `token` from a deep-link callback URL the OS hands back to the
 * app after sign-in. The token may be in the query string or the fragment.
 * Custom schemes (e.g. `myapp://…`) are handled by normalising to a parseable
 * URL first.
 */
export const extractTokenFromRedirect = (redirectUrl: string): string | null => {
  // `new URL` handles custom schemes for query parsing, but some platforms
  // deliver `scheme:/path` without `//`; normalise so parsing is reliable.
  let parsable = redirectUrl;
  try {
    // eslint-disable-next-line no-new
    new URL(parsable);
  } catch {
    parsable = redirectUrl.replace(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/?/, "$1://");
  }

  const url = new URL(parsable);

  const fromQuery = url.searchParams.get("token");
  if (fromQuery) return fromQuery;

  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  if (hash) {
    return new URLSearchParams(hash).get("token");
  }
  return null;
};
