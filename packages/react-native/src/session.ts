import { getPublicKeyPayload } from "./commons";

interface IFetchUserData {
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

export const validatePublicKey = (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }
};

/**
 * Fetches the current user from the identity host's OIDC `userinfo` endpoint.
 * The identity host is taken from the validated public key payload (which the
 * shared parser already constrains to the trusted-host allowlist), so the
 * bearer token is never sent to an attacker-controlled origin.
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

export type { IFetchUserData };
