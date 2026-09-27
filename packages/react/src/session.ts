import {
  fetchUserData as fetchUserInfo,
  isAuthenticatedUserInfo,
} from "@authdog/node-commons";
import { TOKEN_STORAGE_KEY, TOKEN_UPDATED_EVENT } from "./constants";
import { parsePublicKey } from "./public-key";

export interface AuthdogUser {
  id: string;
  environmentId?: string;
  externalId?: string;
  userName?: string;
  displayName?: string;
  provider?: string;
  emails?: {
    value: string;
    primary?: boolean;
    type?: string;
  }[];
  photos?: {
    value: string;
    type?: string;
  }[];
  verifications?: { email?: string; verified?: boolean }[];
  [key: string]: unknown;
}

export interface AuthdogUserResponse {
  user: AuthdogUser;
  meta: {
    code: number;
    message?: string;
  };
}

export const fetchUserData = async (
  publicKey: string,
  token: string,
): Promise<AuthdogUserResponse | null> => {
  const { identityHost, environmentId } = parsePublicKey(publicKey);
  const userData = await fetchUserInfo(identityHost, environmentId, token);

  if (!isAuthenticatedUserInfo(userData)) {
    const status = userData?.meta?.code ?? "unknown";
    throw new Error(`Failed to fetch user info (status ${status})`);
  }

  return userData as unknown as AuthdogUserResponse;
};

export const clearAuthdogSession = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
};
