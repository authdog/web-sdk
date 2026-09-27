import {
  validateAndParsePublicKey,
  type PublicKeyPayload,
} from "@authdog/node-commons";
import { getAuthRedirectUrl, launchAuthFlow } from "./chrome";

export type { PublicKeyPayload };

export interface AuthdogUser {
  id: string;
  displayName?: string;
  userName?: string;
  emails?: { value: string; primary?: boolean; type?: string }[];
  photos?: { value: string; type?: string }[];
  [key: string]: unknown;
}

interface UserInfoResponse {
  user: AuthdogUser;
}

/** JWT shape: three base64url segments separated by dots. */
export const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const getTokenFromUrl = (url: string): string | null => {
  try {
    return new URL(url).searchParams.get("token");
  } catch {
    return null;
  }
};

export const buildAuthorizeUrl = (
  publicKey: string,
  redirectUrl: string,
  signup = false,
): string => {
  const payload = validateAndParsePublicKey(publicKey);
  const url = new URL(
    `${payload.identityHost}/oidc/${payload.environmentId}/authorize`,
  );
  url.searchParams.set("client_id", publicKey);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("redirect_uri", redirectUrl);
  if (signup) url.searchParams.set("prompt", "signup");
  return url.toString();
};

export const authenticate = async (
  publicKey: string,
  signup = false,
): Promise<string> => {
  const redirectUrl = getAuthRedirectUrl();
  const responseUrl = await launchAuthFlow(
    buildAuthorizeUrl(publicKey, redirectUrl, signup),
  );
  const token = getTokenFromUrl(responseUrl);
  if (!token || !JWT_PATTERN.test(token)) {
    throw new Error("Authdog returned an invalid session token");
  }
  return token;
};

export const fetchUser = async (
  publicKey: string,
  token: string,
): Promise<AuthdogUser> => {
  const payload = validateAndParsePublicKey(publicKey);
  const response = await fetch(
    `${payload.identityHost}/oidc/${payload.environmentId}/userinfo`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error("Failed to fetch user info");
  return ((await response.json()) as UserInfoResponse).user;
};
