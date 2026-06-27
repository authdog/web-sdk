import { getSessionCookie } from "./cookies";
import { getServerSidePayloadPublicKey } from "./publicKey";
import { logoutHandler } from "./logout";

export interface AuthdogServerConfig {
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
}

export interface AuthdogServer {
  getSession: (request: Request) => Promise<string | null>;
  getPublicKey: () => string;
  logout: (request: Request) => Promise<Response>;
}

export const createAuthdogServer = (
  config: AuthdogServerConfig,
): AuthdogServer => {
  const { publicKey, secretKey } = config;

  return {
    getSession: async (request: Request) => {
      return await getSessionCookie(request);
    },

    getPublicKey: () => {
      return getServerSidePayloadPublicKey(publicKey);
    },

    logout: async (request: Request) => {
      return await logoutHandler(request, secretKey);
    },
  };
};
