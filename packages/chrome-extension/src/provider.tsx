import {
  buildSessionKey,
  validateAndParsePublicKey,
} from "@authdog/node-commons";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createChromeStorage,
  subscribeToChromeStorage,
  type AuthdogStorage,
} from "./chrome";

export interface AuthdogContextValue {
  publicKey: string;
  token: string | null;
  isLoading: boolean;
  setToken(token: string | null): Promise<void>;
}

export const AuthdogContext = createContext<AuthdogContextValue | null>(null);

export interface AuthdogProviderProps {
  publicKey: string;
  storage?: AuthdogStorage;
  children?: ReactNode;
}

const getStorageKey = (publicKey: string): string =>
  buildSessionKey(validateAndParsePublicKey(publicKey).environmentId);

export const AuthdogProvider = ({
  publicKey,
  storage,
  children,
}: AuthdogProviderProps) => {
  const storageRef = useRef<AuthdogStorage>(storage ?? createChromeStorage());
  const storageKey = useMemo(() => getStorageKey(publicKey), [publicKey]);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    storageRef.current
      .getItem(storageKey)
      .then((value) => active && setTokenState(value))
      .catch(() => {
        if (active) setTokenState(null);
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(
    () => subscribeToChromeStorage(storageKey, setTokenState),
    [storageKey],
  );

  const setToken = useCallback(
    async (value: string | null) => {
      setTokenState(value);
      if (value) await storageRef.current.setItem(storageKey, value);
      else await storageRef.current.removeItem(storageKey);
    },
    [storageKey],
  );

  const context = useMemo(
    () => ({ publicKey, token, isLoading, setToken }),
    [publicKey, token, isLoading, setToken],
  );

  return (
    <AuthdogContext.Provider value={context}>
      {children}
    </AuthdogContext.Provider>
  );
};
