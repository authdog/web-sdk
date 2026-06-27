"use client";

import { useEffect, useState } from "react";
import { TOKEN_STORAGE_KEY, TOKEN_UPDATED_EVENT } from "../client/constants";

export interface UseAuthResult {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = (): UseAuthResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setToken(null);
      setIsLoading(false);
      return;
    }

    const readTokenFromStorage = () =>
      window.localStorage.getItem(TOKEN_STORAGE_KEY);

    const syncToken = () => {
      const nextToken = readTokenFromStorage();
      setToken((currentToken) =>
        currentToken === nextToken ? currentToken : nextToken,
      );
    };

    syncToken();
    setIsLoading(false);

    const handleTokenUpdate = () => {
      syncToken();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TOKEN_STORAGE_KEY) {
        syncToken();
      }
    };

    window.addEventListener(TOKEN_UPDATED_EVENT, handleTokenUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(TOKEN_UPDATED_EVENT, handleTokenUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    token,
    isAuthenticated: Boolean(token),
    isLoading,
  };
};
