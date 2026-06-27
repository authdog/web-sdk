import { assertTrustedIdentityHost } from "./public-key";

export interface UserInfoResponse {
  user?: unknown;
  meta?: { code?: number; [key: string]: unknown };
  [key: string]: unknown;
}

/**
 * Fetches user data from the identity host's OIDC `userinfo` endpoint.
 *
 * The `identityHost` is validated against the trusted-host allowlist before the
 * bearer token is sent, preventing SSRF / token exfiltration via a crafted
 * public key. Callers MUST still check `meta.code === 200` (and that `user` is
 * present) before treating the result as authenticated — a `200` HTTP response
 * can carry a non-success envelope.
 */
export const fetchUserData = async (
  identityHost: string,
  environmentId: string,
  token: string,
): Promise<UserInfoResponse> => {
  const safeHost = assertTrustedIdentityHost(identityHost);

  const userData = await fetch(
    `${safeHost}/oidc/${encodeURIComponent(environmentId)}/userinfo`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!userData.ok) {
    throw new Error(`Failed to fetch user info (status ${userData.status})`);
  }

  return userData.json() as Promise<UserInfoResponse>;
};

/**
 * Convenience guard: returns true only when the userinfo envelope represents a
 * genuinely authenticated user.
 */
export const isAuthenticatedUserInfo = (
  data: UserInfoResponse | null | undefined,
): boolean => Boolean(data && data.meta?.code === 200 && data.user);
