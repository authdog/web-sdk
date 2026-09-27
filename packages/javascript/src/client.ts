import {
  fetchUserData,
  isAuthenticatedUserInfo,
  listBillingPlans,
  getBillingSubscription,
  createBillingSubscription,
  cancelBillingSubscription,
  type PublicKeyPayload,
  type BillingPlansResponse,
  type BillingSubscriptionResponse,
  type CreateBillingSubscriptionResponse,
} from "@authdog/node-commons";
import { getPublicKeyPayload } from "./commons";
import {
  TOKEN_STORAGE_KEY,
  TOKEN_UPDATED_EVENT,
  buildAuthorizeUrl,
  buildSigninUrl,
  isJwtShaped,
} from "./session";

export interface AuthdogClientConfig {
  /** The Authdog public key (`pk_…`). Safe to expose to the browser. */
  publicKey: string;
  /** Override the localStorage key used to persist the token. */
  storageKey?: string;
}

export interface AuthdogClient {
  /** The current token from storage, or `null`. */
  getToken: () => string | null;
  /** Whether a token is currently present. Presence only — not verified. */
  isAuthenticated: () => boolean;
  /**
   * Consumes a `?token=` on the current URL (e.g. after an OIDC redirect):
   * persists JWT-shaped values, strips the param from the address bar, and
   * returns the token (or `null` if none/!JWT). Safe to call on every load.
   */
  handleRedirectCallback: () => string | null;
  /** Redirects the browser to the OIDC sign-in flow. */
  signIn: (redirectUri?: string) => void;
  /** Redirects the browser to the OIDC sign-up flow. */
  signUp: (redirectUri?: string) => void;
  /** Clears the token; optionally redirects afterwards. */
  signOut: (redirectTo?: string) => void;
  /** Resolves the current user via the OIDC `userinfo` endpoint, or `null`. */
  getUser: () => Promise<unknown | null>;
  /** Subscribes to token changes (this tab and others). Returns unsubscribe. */
  subscribe: (listener: (token: string | null) => void) => () => void;
  /** The validated, parsed public-key payload. */
  getPublicKeyPayload: () => PublicKeyPayload;
  /** The validated public-key payload as a JSON string. */
  getPublicKey: () => string;
  /** The OIDC sign-in URL (for use as a plain link target). */
  getSigninUrl: () => string;
  /** Plans/subscriptions catalog + checkout (Dashboard → Billing). */
  billing: {
    /** Publicly-visible plans + features for this environment. No auth required. */
    listPlans: (options?: {
      for?: "user" | "org";
    }) => Promise<BillingPlansResponse>;
    /** The current user's subscription, or `null` if unauthenticated/none. */
    getSubscription: () => Promise<BillingSubscriptionResponse | null>;
    /**
     * Start (or restart) a subscription. Returns a Stripe PaymentIntent
     * `clientSecret` for `CheckoutButton` to confirm via Stripe Elements.
     */
    createSubscription: (params: {
      planId: string;
      planPeriod?: "month" | "annual";
    }) => Promise<CreateBillingSubscriptionResponse | null>;
    /** Cancel the current subscription at the end of the current period. */
    cancelSubscription: () => Promise<boolean>;
  };
}

/**
 * Creates a framework-agnostic Authdog browser client.
 *
 * The public key is validated and parsed once here — enforcing the trusted
 * identity-host allowlist (SSRF / token-exfiltration protection) — so a
 * malformed or untrusted key fails fast rather than on first use.
 *
 * The token lives in `localStorage`. This is appropriate for SPA/public-client
 * flows where the browser must send the token itself; for server-rendered apps
 * that can hold an HttpOnly cookie, prefer the server-side framework SDKs.
 */
export const createAuthdogClient = (
  config: AuthdogClientConfig,
): AuthdogClient => {
  if (!config.publicKey) {
    throw new Error("Public key is not defined");
  }

  const payload = getPublicKeyPayload(config.publicKey);
  const storageKey = config.storageKey ?? TOKEN_STORAGE_KEY;

  const hasWindow = () => typeof window !== "undefined";

  const getToken = (): string | null =>
    hasWindow() ? window.localStorage.getItem(storageKey) : null;

  const setToken = (token: string | null): void => {
    if (!hasWindow()) return;
    if (token === null) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, token);
    }
    window.dispatchEvent(
      new CustomEvent(TOKEN_UPDATED_EVENT, { detail: token }),
    );
  };

  return {
    getToken,

    isAuthenticated: () => !!getToken(),

    handleRedirectCallback: () => {
      if (!hasWindow()) return null;
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      if (!token) return null;

      // Always strip the token from the URL, valid or not.
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());

      // Only persist values that look like a JWT to avoid storing arbitrary
      // attacker-supplied data.
      if (!isJwtShaped(token)) return null;

      setToken(token);
      return token;
    },

    signIn: (redirectUri?: string) => {
      if (!hasWindow()) return;
      window.location.href = buildAuthorizeUrl(payload, config.publicKey, {
        redirectUri,
      });
    },

    signUp: (redirectUri?: string) => {
      if (!hasWindow()) return;
      window.location.href = buildAuthorizeUrl(payload, config.publicKey, {
        redirectUri,
        prompt: "signup",
      });
    },

    signOut: (redirectTo?: string) => {
      setToken(null);
      if (hasWindow() && redirectTo) {
        window.location.href = redirectTo;
      }
    },

    getUser: async () => {
      const token = getToken();
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

    subscribe: (listener) => {
      if (!hasWindow()) return () => {};
      const onCustom = (event: Event) => {
        listener((event as CustomEvent<string | null>).detail ?? null);
      };
      const onStorage = (event: StorageEvent) => {
        if (event.key === storageKey) listener(event.newValue);
      };
      window.addEventListener(TOKEN_UPDATED_EVENT, onCustom);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(TOKEN_UPDATED_EVENT, onCustom);
        window.removeEventListener("storage", onStorage);
      };
    },

    getPublicKeyPayload: () => payload,
    getPublicKey: () => JSON.stringify(payload),
    getSigninUrl: () => buildSigninUrl(payload),

    billing: {
      listPlans: (options) =>
        listBillingPlans(payload.identityHost, payload.environmentId, options),

      getSubscription: async () => {
        const token = getToken();
        if (!token) return null;
        try {
          return await getBillingSubscription(
            payload.identityHost,
            payload.environmentId,
            token,
          );
        } catch {
          return null;
        }
      },

      createSubscription: async (params) => {
        const token = getToken();
        if (!token) return null;
        try {
          return await createBillingSubscription(
            payload.identityHost,
            payload.environmentId,
            token,
            params,
          );
        } catch {
          return null;
        }
      },

      cancelSubscription: async () => {
        const token = getToken();
        if (!token) return false;
        try {
          const result = await cancelBillingSubscription(
            payload.identityHost,
            payload.environmentId,
            token,
          );
          return Boolean(result?.success);
        } catch {
          return false;
        }
      },
    },
  };
};
