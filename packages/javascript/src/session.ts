import type { PublicKeyPayload } from "@authdog/node-commons";

/** localStorage key under which the session token is persisted. */
export const TOKEN_STORAGE_KEY = "token";

/**
 * Event dispatched on `window` whenever the token changes within the current
 * tab (the native `storage` event only fires in *other* tabs).
 */
export const TOKEN_UPDATED_EVENT = "authdog:token-updated";

/** JWT shape: three base64url segments separated by dots. */
export const JWT_PATTERN =
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** Extracts the `token` query parameter from a full URL string. */
export const getTokenFromUri = (url: string): string | null => {
  return new URL(url).searchParams.get("token");
};

/** Whether a value looks like a JWT (and is therefore safe to persist). */
export const isJwtShaped = (value: string): boolean => JWT_PATTERN.test(value);

export interface AuthorizeUrlOptions {
  /** Where the identity provider should send the user back to. */
  redirectUri?: string;
  /** Set to `"signup"` to land the user on the sign-up screen. */
  prompt?: "signup";
}

/**
 * Builds the OIDC `authorize` URL for a validated public-key payload. The
 * payload MUST come from {@link getPublicKeyPayload} so the identity host has
 * already passed the trusted-host allowlist.
 */
export const buildAuthorizeUrl = (
  payload: PublicKeyPayload,
  publicKey: string,
  options: AuthorizeUrlOptions = {},
): string => {
  const authUrl = new URL(
    `${payload.identityHost}/oidc/${payload.environmentId}/authorize`,
  );
  authUrl.searchParams.set("client_id", publicKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set(
    "redirect_uri",
    options.redirectUri ??
      (typeof window !== "undefined" ? window.location.origin : ""),
  );
  if (options.prompt) {
    authUrl.searchParams.set("prompt", options.prompt);
  }
  return authUrl.toString();
};

/** Builds the OIDC `signin` URL used as a plain link target. */
export const buildSigninUrl = (payload: PublicKeyPayload): string =>
  `${payload.identityHost}/signin/${payload.environmentId}`;
