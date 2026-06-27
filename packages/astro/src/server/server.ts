import {
  fetchUserData,
  isAuthenticatedUserInfo,
  type UserInfoResponse,
} from "@authdog/node-commons";

import { getPublicKeyPayload } from "../commons";
import { DEFAULT_SESSION_COOKIE, getSessionCookie } from "./cookies";
import { getServerSidePayloadPublicKey } from "./publicKey";
import { logoutHandler } from "./logout";

export interface AuthdogServerConfig {
  publicKey: string;
  /** Reserved for future server-side session revocation; not yet used. */
  secretKey?: string;
  /** Cookie name holding the session token. Defaults to `authdog-session`. */
  cookieName?: string;
}

export interface AuthdogServer {
  /** Reads the raw session token from the request cookie, or null. */
  getSession: (request: Request) => Promise<string | null>;
  /**
   * Resolves the authenticated user from the identity host's userinfo
   * endpoint, or null when there is no valid session.
   */
  getUser: (request: Request) => Promise<UserInfoResponse | null>;
  /** Returns the validated public-key payload as a JSON string. */
  getPublicKey: () => string;
  /** Clears the session cookie and returns a redirect Response. */
  logout: (request: Request) => Promise<Response>;
}

/**
 * Creates a framework-agnostic server helper for Astro endpoints, actions and
 * `.astro` frontmatter. Everything operates on the standard `Request` /
 * `Response` objects Astro already exposes (`Astro.request`, API routes).
 */
export const createAuthdogServer = (
  config: AuthdogServerConfig,
): AuthdogServer => {
  const { publicKey, cookieName = DEFAULT_SESSION_COOKIE } = config;

  return {
    getSession: async (request: Request) => {
      return await getSessionCookie(request, cookieName);
    },

    getUser: async (request: Request) => {
      const token = await getSessionCookie(request, cookieName);
      if (!token) {
        return null;
      }

      const { identityHost, environmentId } = getPublicKeyPayload(publicKey);
      const data = await fetchUserData(identityHost, environmentId, token);

      return isAuthenticatedUserInfo(data) ? data : null;
    },

    getPublicKey: () => {
      return getServerSidePayloadPublicKey(publicKey);
    },

    logout: async (request: Request) => {
      return await logoutHandler(request, cookieName);
    },
  };
};
