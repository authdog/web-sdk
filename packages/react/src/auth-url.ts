import { parsePublicKey } from "./public-key";

export interface BuildAuthorizeUrlOptions {
  redirectUrl: string;
  signup?: boolean;
}

export const buildAuthorizeUrl = (
  publicKey: string,
  { redirectUrl, signup }: BuildAuthorizeUrlOptions,
): string => {
  const payload = parsePublicKey(publicKey);
  const authUrl = new URL(
    `${payload.identityHost}/oidc/${payload.environmentId}/authorize`,
  );
  authUrl.searchParams.set("client_id", publicKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("redirect_uri", redirectUrl);
  if (signup) {
    authUrl.searchParams.set("prompt", "signup");
  }
  return authUrl.toString();
};
