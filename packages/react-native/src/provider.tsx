import { buildSessionKey } from "@authdog/node-commons";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getPublicKeyPayload } from "./commons";
import { type AuthdogStorage, inMemoryStorage } from "./storage";

export interface AuthdogContextValue {
  /** The Authdog public key (`pk_…`) the app was configured with. */
  readonly publicKey: string;
  /** `true` while the persisted token is being loaded from storage on mount. */
  readonly isLoading: boolean;
  /** The current session token, or `null` when signed out. */
  readonly token: string | null;
  /** Async-aware token storage backing this provider. */
  readonly storage: AuthdogStorage;
  /** The storage key the session token is persisted under. */
  readonly storageKey: string;
  /**
   * Persists (or clears, when passed `null`) the token in storage and updates
   * the in-memory state. The returned promise resolves once storage settles.
   */
  setToken: (token: string | null) => Promise<void>;
}

export const AuthdogContext = createContext<AuthdogContextValue | null>(null);

/**
 * Resolves the storage key for a given public key. Falls back to a stable
 * default if the key cannot be parsed, so a misconfigured key never throws
 * during render.
 */
const resolveStorageKey = (publicKey: string): string => {
  try {
    return buildSessionKey(getPublicKeyPayload(publicKey).environmentId);
  } catch {
    return "token";
  }
};

export interface AuthdogProviderProps {
  /** Your Authdog public key (`pk_…`). */
  publicKey: string;
  /**
   * Token storage. Defaults to an in-memory store (token is lost on restart).
   * Provide a secure store in production — see `createSecureStoreAdapter`.
   */
  storage?: AuthdogStorage;
  children?: ReactNode;
}

export const AuthdogProvider = ({
  publicKey,
  storage,
  children,
}: AuthdogProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  // Keep storage / key stable across renders so effects don't re-run and the
  // returned context identity only changes when state actually changes.
  const storageRef = useRef<AuthdogStorage>(storage ?? inMemoryStorage());
  if (storage && storageRef.current !== storage) {
    storageRef.current = storage;
  }
  const storageKey = useMemo(() => resolveStorageKey(publicKey), [publicKey]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const existing = await storageRef.current.getItem(storageKey);
        if (!cancelled && existing) {
          setTokenState(existing);
        }
      } catch {
        // A storage read failure is non-fatal: treat it as "signed out".
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const setToken = useCallback(
    async (next: string | null) => {
      setTokenState(next);
      if (next === null) {
        await storageRef.current.removeItem(storageKey);
      } else {
        await storageRef.current.setItem(storageKey, next);
      }
    },
    [storageKey],
  );

  const value = useMemo<AuthdogContextValue>(
    () => ({
      publicKey,
      isLoading,
      token,
      storage: storageRef.current,
      storageKey,
      setToken,
    }),
    [publicKey, isLoading, token, storageKey, setToken],
  );

  return (
    <AuthdogContext.Provider value={value}>{children}</AuthdogContext.Provider>
  );
};
