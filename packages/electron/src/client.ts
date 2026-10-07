import {
  fetchUserData,
  isAuthenticatedUserInfo,
  type PublicKeyPayload,
} from "@authdog/node-commons";
import { getPublicKeyPayload } from "./commons";
import {
  TOKEN_STORAGE_KEY,
  buildAuthorizeUrl,
  extractTokenFromRedirect,
  isJwtShaped,
} from "./session";

/**
 * Pluggable async token store. Defaults to a `localStorage`-backed store when
 * a DOM is present. In the Electron main process, pass `safeStorage` or a
 * file-backed store instead.
 */
export interface TokenStorage {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

const localStorageStore: TokenStorage = {
  getItem: (key) =>
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};

export interface AuthdogClientConfig {
  /** The Authdog public key (`pk_…`). */
  publicKey: string;
  /** The app's deep-link callback URL (e.g. `myapp://auth/callback`). */
  redirectUri: string;
  /**
   * Opens a URL in the system browser. Defaults to `window.open`. In the main
   * process, pass `createElectronOpener(shell)` or `shell.openExternal`.
   */
  openUrl?: (url: string) => void | Promise<void>;
  /** Token store. Defaults to a `localStorage`-backed store. */
  storage?: TokenStorage;
  /** Override the storage key used to persist the token. */
  storageKey?: string;
}

export interface AuthdogClient {
  /** The current token from storage, or `null`. */
  getToken: () => Promise<string | null>;
  /** Whether a token is currently present. Presence only — not verified. */
  isAuthenticated: () => Promise<boolean>;
  /**
   * Opens the OIDC sign-in flow in the system browser. The identity provider
   * redirects back to the app's `redirectUri` deep link; feed that URL to
   * {@link AuthdogClient.handleCallback} to complete sign-in.
   */
  signIn: (options?: { prompt?: "signup" }) => Promise<void>;
  /** Convenience for `signIn({ prompt: "signup" })`. */
  signUp: () => Promise<void>;
  /**
   * Completes sign-in from the deep-link callback URL the OS delivered (e.g.
   * via `app.on('open-url')` or a custom protocol). Persists a JWT-shaped
   * token and returns it, or `null`.
   */
  handleCallback: (callbackUrl: string) => Promise<string | null>;
  /** Clears the persisted token. */
  signOut: () => Promise<void>;
  /** Resolves the current user via the OIDC `userinfo` endpoint, or `null`. */
  getUser: () => Promise<unknown | null>;
  /** The validated, parsed public-key payload. */
  getPublicKeyPayload: () => PublicKeyPayload;
  /** The validated public-key payload as a JSON string. */
  getPublicKey: () => string;
}

/**
 * Creates an Authdog client for an Electron desktop app.
 *
 * Sign-in opens the system browser and returns via a deep link, so no
 * credentials pass through the app window. The public key is validated and
 * parsed once here — enforcing the trusted identity-host allowlist — so a
 * malformed or untrusted key fails fast.
 */
export const createAuthdogClient = (
  config: AuthdogClientConfig,
): AuthdogClient => {
  if (!config.publicKey) {
    throw new Error("Public key is not defined");
  }
  if (!config.redirectUri) {
    throw new Error("redirectUri is not defined");
  }

  const payload = getPublicKeyPayload(config.publicKey);
  const storage = config.storage ?? localStorageStore;
  const storageKey = config.storageKey ?? TOKEN_STORAGE_KEY;
  const openUrl =
    config.openUrl ??
    ((url: string) => {
      if (typeof window !== "undefined") window.open(url, "_blank");
    });

  const getToken = async (): Promise<string | null> =>
    (await storage.getItem(storageKey)) ?? null;

  const openFlow = async (prompt?: "signup"): Promise<void> => {
    const authUrl = buildAuthorizeUrl(payload, config.publicKey, {
      redirectUri: config.redirectUri,
      prompt,
    });
    await openUrl(authUrl);
  };

  return {
    getToken,

    isAuthenticated: async () => !!(await getToken()),

    signIn: (options) => openFlow(options?.prompt),

    signUp: () => openFlow("signup"),

    handleCallback: async (callbackUrl) => {
      const token = extractTokenFromRedirect(callbackUrl);
      if (!token || !isJwtShaped(token)) return null;
      await storage.setItem(storageKey, token);
      return token;
    },

    signOut: async () => {
      await storage.removeItem(storageKey);
    },

    getUser: async () => {
      const token = await getToken();
      if (!token) return null;
      try {
        const info = await fetchUserData(
          payload.identityHost,
          payload.environmentId,
          token,
        );
        return isAuthenticatedUserInfo(info) ? (info.user ?? null) : null;
      } catch {
        return null;
      }
    },

    getPublicKeyPayload: () => payload,
    getPublicKey: () => JSON.stringify(payload),
  };
};
