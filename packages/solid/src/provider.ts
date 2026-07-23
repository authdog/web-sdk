import {
  createComponent,
  createContext,
  createSignal,
  onMount,
  type Accessor,
  type JSX,
} from "solid-js";
import { getPublicKeyPayload } from "./commons";
import { JWT_PATTERN, TOKEN_STORAGE_KEY } from "./session";

/** The reactive authentication context shared through {@link AuthdogProvider}. */
export interface AuthdogContextValue {
  /** The current session token, or `null`. */
  token: Accessor<string | null>;
  /** Whether the client is still bootstrapping the token on first load. */
  isLoading: Accessor<boolean>;
  /** Whether a token is present. Presence only — treat as a UI hint. */
  isAuthenticated: Accessor<boolean>;
  /** Persists (or clears) the token and updates reactive state. */
  setToken: (token: string | null) => void;
  /** The configured public key (`pk_…`). */
  publicKey: string;
}

export const AuthdogContext = createContext<AuthdogContextValue>();

export interface AuthdogProviderProps {
  /** The Authdog public key (`pk_…`). Safe to expose to the browser. */
  publicKey: string;
  children?: JSX.Element;
}

/**
 * Provides the reactive Authdog auth context to descendant components.
 *
 * The public key is validated once at construction (enforcing the trusted
 * identity-host allowlist). On mount (browser only) it consumes a `?token=`
 * from the URL — persisting JWT-shaped values to `localStorage` and reloading
 * so the server sees the token — otherwise it hydrates from `localStorage`.
 */
export function AuthdogProvider(props: AuthdogProviderProps): JSX.Element {
  // Validate + parse eagerly so an invalid/untrusted key throws at startup.
  getPublicKeyPayload(props.publicKey);

  const [token, setTokenSignal] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  const setToken = (next: string | null) => {
    setTokenSignal(next);
    if (typeof window === "undefined") return;
    if (next === null) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, next);
    }
  };

  onMount(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
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

    const existing = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (existing) {
      setTokenSignal(existing);
    }
    setIsLoading(false);
  });

  const value: AuthdogContextValue = {
    token,
    isLoading,
    isAuthenticated: () => !!token(),
    setToken,
    publicKey: props.publicKey,
  };

  return createComponent(AuthdogContext.Provider, {
    value,
    get children() {
      return props.children;
    },
  });
}
