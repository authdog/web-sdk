"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchUserData,
  type AuthdogUser,
} from "../client/session";
import { useAuth } from "./use-auth";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PK_AUTHDOG;

export interface UseUserResult {
  user: AuthdogUser | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserResult => {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [user, setUser] = useState<AuthdogUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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
    fetchProfile().catch(() => {
      /* error is already stored in state */
    });
  }, [fetchProfile]);

  return {
    user,
    isLoading: isAuthLoading || isFetching,
    error,
    refetch: fetchProfile,
  };
};
