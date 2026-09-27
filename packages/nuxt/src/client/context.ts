import { ref, type InjectionKey } from "vue";
import { JWT_PATTERN, TOKEN_STORAGE_KEY } from "./session";

/** The reactive authentication context provided by the Authdog Nuxt plugin. */
export interface AuthdogContext {
  /** Whether the client is still bootstrapping the token on first load. */
  readonly isLoading: boolean;
  /** The current session token, or `null`. */
  readonly token: string | null;
  /** The configured public key (`pk_…`). */
  readonly publicKey: string;
  /** Persists (or clears) the token and updates reactive state. */
  setToken: (token: string | null) => void;
}

export const AUTHDOG_CONTEXT_KEY: InjectionKey<AuthdogContext> =
  Symbol("authdog");

/** The internal context plus a `bootstrap` step run once by the plugin. */
export interface AuthdogContextInternal extends AuthdogContext {
  bootstrap: () => void;
}

/**
 * Builds the reactive Authdog context. State is exposed through getters so
 * consumers always read the live ref values. `bootstrap()` consumes a
 * `?token=` from the URL (browser only), persisting JWT-shaped values and
 * reloading so the server sees the token, otherwise hydrates from
 * `localStorage`.
 */
export const createAuthdogContext = (
  publicKey: string,
): AuthdogContextInternal => {
  const isLoading = ref(true);
  const token = ref<string | null>(null);

  const setToken = (next: string | null) => {
    token.value = next;
    if (typeof window === "undefined") return;
    if (next === null) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, next);
    }
  };

  const bootstrap = () => {
    if (typeof window === "undefined") {
      isLoading.value = false;
      return;
    }

    const url = new URL(window.location.href);
    const urlToken = url.searchParams.get("token");

    if (urlToken) {
      // Always strip the token from the URL, valid or not.
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());

      if (JWT_PATTERN.test(urlToken)) {
        setToken(urlToken);
        window.location.reload();
        return;
      }
    }

    const existing = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (existing) {
      token.value = existing;
    }
    isLoading.value = false;
  };

  return {
    get isLoading() {
      return isLoading.value;
    },
    get token() {
      return token.value;
    },
    get publicKey() {
      return publicKey;
    },
    setToken,
    bootstrap,
  };
};
