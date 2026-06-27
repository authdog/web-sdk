import { getPublicKeyPayload } from "./commons";

export interface BuildAuthorizeUrlOptions {
  /**
   * The app's deep-link/callback URL the identity server redirects back to,
   * e.g. `myapp://callback`. This is registered as the OIDC `redirect_uri`.
   */
  redirectUrl: string;
  /** When `true`, hints the hosted UI to show the sign-up flow. */
  signup?: boolean;
}

/**
 * Builds the hosted OIDC authorize URL for the given public key.
 *
 * The identity host comes from the validated public key payload (constrained to
 * the trusted-host allowlist by the shared parser), so a crafted key cannot
 * point the login flow at an attacker-controlled origin.
 */
export const buildAuthorizeUrl = (
  publicKey: string,
  { redirectUrl, signup }: BuildAuthorizeUrlOptions,
): string => {
  const payload = getPublicKeyPayload(publicKey);

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
