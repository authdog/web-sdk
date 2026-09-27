import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  JWT_PATTERN,
  TOKEN_STORAGE_KEY,
  TOKEN_UPDATED_EVENT,
} from "./constants";

export interface AuthdogContextValue {
  publicKey: string;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
}

export const AuthdogContext = createContext<AuthdogContextValue | null>(null);

export interface AuthdogProviderProps {
  publicKey: string;
  children?: ReactNode;
  /**
   * When true (default), capture `?token=` from the URL into localStorage and
   * strip it from the address bar.
   */
  captureTokenFromUrl?: boolean;
}

export const AuthdogProvider = ({
  publicKey,
  children,
  captureTokenFromUrl = true,
}: AuthdogProviderProps) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") {
      setTokenState(value);
      return;
    }
    if (value) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setTokenState(value);
    window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    if (captureTokenFromUrl) {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        if (JWT_PATTERN.test(urlToken)) {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, urlToken);
          setTokenState(urlToken);
        }
        params.delete("token");
        const next = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }${window.location.hash}`;
        window.history.replaceState({}, document.title, next || "/");
        window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
        setIsLoading(false);
        return;
      }
    }

    setTokenState(window.localStorage.getItem(TOKEN_STORAGE_KEY));
    setIsLoading(false);
  }, [captureTokenFromUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => {
      setTokenState(window.localStorage.getItem(TOKEN_STORAGE_KEY));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_STORAGE_KEY) sync();
    };

    window.addEventListener(TOKEN_UPDATED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(TOKEN_UPDATED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo(
    () => ({ publicKey, token, isLoading, setToken }),
    [publicKey, token, isLoading, setToken],
  );

  return (
    <AuthdogContext.Provider value={value}>{children}</AuthdogContext.Provider>
  );
};
