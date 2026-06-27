import { getPublicKeyPayload, validatePublicKey } from "./commons";

/** Shared localStorage key for the persisted token. */
export const TOKEN_STORAGE_KEY = "token";

/** JWT shape: three base64url segments separated by dots. */
export const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const getTokenFromUri = (url: string): string | null => {
  return new URL(url).searchParams.get("token");
};

export interface IFetchUserData {
  user: {
    id: string;
    environmentId: string;
    externalId: string;
    userName: string;
    displayName: string;
    nickName: string;
    profileUrl: string;
    title: string;
    userType: string;
    preferredLanguage: string | null;
    locale: string | null;
    timezone: string | null;
    active: boolean;
    provider: string;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    names: {
      id: string;
      userId: string;
      formatted: string | null;
      familyName: string;
      givenName: string;
      middleName: string | null;
      honorificPrefix: string | null;
      honorificSuffix: string | null;
      createdAt: string;
      updatedAt: string;
    };
    addresses: [];
    emails: {
      value: string;
      primary: boolean;
      type: string;
    }[];
    phoneNumbers: [];
    ims: [];
    photos: {
      value: string;
      type: string;
    }[];
  };
  meta: {
    code: number;
    message: string;
  };
}

/**
 * Fetches user data from the identity host's OIDC `userinfo` endpoint. The
 * identity host is decoded through the hardened public-key parser, which
 * enforces the trusted-host allowlist before the bearer token is ever sent.
 */
export const fetchUserData = async (
  publicKey: string,
  token: string,
): Promise<IFetchUserData | null> => {
  validatePublicKey(publicKey);
  const publicKeyObj = getPublicKeyPayload(publicKey);

  const userData = await fetch(
    `${publicKeyObj.identityHost}/oidc/${publicKeyObj.environmentId}/userinfo`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!userData.ok) {
    throw new Error("Failed to fetch user info");
  }

  return (await userData.json()) as IFetchUserData;
};

/**
 * Builds the OIDC authorize URL for a sign-in or sign-up redirect. The public
 * key is decoded through the hardened parser (no raw base64/JSON) so an
 * untrusted identity host can never be used as the redirect target.
 */
export const buildAuthorizeUrl = (
  publicKey: string,
  redirectUri: string,
  options: { signup?: boolean } = {},
): string => {
  validatePublicKey(publicKey);
  const publicKeyObj = getPublicKeyPayload(publicKey);

  const authUrl = new URL(
    `${publicKeyObj.identityHost}/oidc/${publicKeyObj.environmentId}/authorize`,
  );
  authUrl.searchParams.set("client_id", publicKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("redirect_uri", redirectUri);

  if (options.signup) {
    authUrl.searchParams.set("prompt", "signup");
  }

  return authUrl.toString();
};
