"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  TOKEN_POLL_INTERVAL_MS,
  TOKEN_POLL_MAX_ATTEMPTS,
  TOKEN_STORAGE_KEY,
  TOKEN_UPDATED_EVENT,
} from "../client/constants";
import { fetchUserData, type AuthdogUser } from "../client/session";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PK_AUTHDOG;

export interface UseUserResult {
  user: AuthdogUser | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenInitialized, setIsTokenInitialized] = useState(false);
  const [user, setUser] = useState<AuthdogUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setToken(null);
      setIsTokenInitialized(true);
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
    setIsTokenInitialized(true);

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

    let pollCount = 0;
    const pollInterval = window.setInterval(() => {
      pollCount++;
      syncToken();

      if (pollCount >= TOKEN_POLL_MAX_ATTEMPTS) {
        window.clearInterval(pollInterval);
      }
    }, TOKEN_POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener(TOKEN_UPDATED_EVENT, handleTokenUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.clearInterval(pollInterval);
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      if (isMountedRef.current) {
        setUser(null);
        setError(null);
        setIsFetching(false);
      }
      return;
    }

    if (!PUBLIC_KEY) {
      const publicKeyError = new Error(
        "NEXT_PUBLIC_PK_AUTHDOG environment variable is not set",
      );
      if (isMountedRef.current) {
        setError(publicKeyError);
        setUser(null);
      }
      throw publicKeyError;
    }

    if (isMountedRef.current) {
      setIsFetching(true);
    }

    try {
      const response = await fetchUserData(PUBLIC_KEY, token);
      if (isMountedRef.current) {
        setUser(response?.user ?? null);
        setError(null);
      }
    } catch (err) {
      const nextError =
        err instanceof Error
          ? err
          : new Error("Unexpected error fetching Authdog user");
      if (process.env.NODE_ENV !== "production") {
        console.error("Error fetching Authdog user profile:", nextError);
      }
      if (isMountedRef.current) {
        setUser(null);
        setError(nextError);
      }
      throw nextError;
    } finally {
      if (isMountedRef.current) {
        setIsFetching(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!isTokenInitialized) {
      return;
    }

    fetchProfile().catch(() => {
      /* error is already stored in state */
    });
  }, [fetchProfile, isTokenInitialized]);

  return {
    user,
    isLoading: !isTokenInitialized || isFetching,
    error,
    refetch: fetchProfile,
  };
};
