import {
  fetchUserData as fetchUserDataCommon,
  isAuthenticatedUserInfo,
  type PublicKeyPayload,
} from "@authdog/node-commons";
import { getPublicKeyPayload } from "../commons";

/** localStorage key under which the session token is persisted. */
export const TOKEN_STORAGE_KEY = "token";

/** JWT shape: three base64url segments separated by dots. */
export const JWT_PATTERN =
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** Extracts the `token` query parameter from a full URL string. */
export const getTokenFromUri = (url: string): string | null =>
  new URL(url).searchParams.get("token");

export interface AuthorizeUrlOptions {
  redirectUri?: string;
  prompt?: "signup";
}

/** Builds the OIDC `authorize` URL for a validated public-key payload. */
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

/**
 * Resolves the current user via the OIDC `userinfo` endpoint. Delegates to the
 * hardened `@authdog/node-commons` fetcher (which re-validates the host) and
 * returns the `user` object only when the envelope reports success.
 */
export const fetchUser = async (
  publicKey: string,
  token: string,
): Promise<unknown | null> => {
  const payload = getPublicKeyPayload(publicKey);
  const info = await fetchUserDataCommon(
    payload.identityHost,
    payload.environmentId,
    token,
  );
  return isAuthenticatedUserInfo(info) ? (info.user ?? null) : null;
};
