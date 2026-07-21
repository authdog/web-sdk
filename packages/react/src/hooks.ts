import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildAuthorizeUrl } from "./auth-url";
import { AuthdogContext } from "./provider";
import { clearAuthdogSession, fetchUserData, type AuthdogUser } from "./session";

const useAuthdogContext = (hook: string) => {
  const context = useContext(AuthdogContext);
  if (!context) {
    throw new Error(`${hook} must be used inside an AuthdogProvider`);
  }
  return context;
};

export const useAuth = () => {
  const { publicKey, token, isLoading, setToken } = useAuthdogContext("useAuth");
  return {
    publicKey,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    setToken,
  };
};

export const useSession = () => {
  const { token, isLoading } = useAuthdogContext("useSession");
  const session = useMemo(
    () => ({ token, isAuthenticated: Boolean(token) }),
    [token],
  );
  return { session, isLoading };
};

export const useSignIn = () => {
  const { publicKey } = useAuthdogContext("useSignIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(
    async (redirectUrl?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = buildAuthorizeUrl(publicKey, {
          redirectUrl:
            redirectUrl ||
            (typeof window !== "undefined" ? window.location.origin : "/"),
        });
        if (typeof window !== "undefined") {
          window.location.href = url;
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause : new Error("Sign in failed"));
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey],
  );

  return { signIn, isLoading, error };
};

export const useSignUp = () => {
  const { publicKey } = useAuthdogContext("useSignUp");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signUp = useCallback(
    async (redirectUrl?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = buildAuthorizeUrl(publicKey, {
          redirectUrl:
            redirectUrl ||
            (typeof window !== "undefined" ? window.location.origin : "/"),
          signup: true,
        });
        if (typeof window !== "undefined") {
          window.location.href = url;
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause : new Error("Sign up failed"));
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey],
  );

  return { signUp, isLoading, error };
};

export const useSignOut = () => {
  const { setToken } = useAuthdogContext("useSignOut");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      clearAuthdogSession();
      setToken(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Sign out failed"));
    } finally {
      setIsLoading(false);
    }
  }, [setToken]);

  return { signOut, isLoading, error };
};

export const useUser = () => {
  const { publicKey, token, isLoading: authLoading } =
    useAuthdogContext("useUser");
  const [user, setUser] = useState<AuthdogUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!token) {
      if (mounted.current) {
        setUser(null);
        setError(null);
        setIsFetching(false);
      }
      return;
    }

    if (mounted.current) setIsFetching(true);
    try {
      const response = await fetchUserData(publicKey, token);
      if (mounted.current) {
        setUser(response?.user ?? null);
        setError(null);
      }
    } catch (cause) {
      const nextError =
        cause instanceof Error ? cause : new Error("Failed to fetch user");
      if (mounted.current) {
        setUser(null);
        setError(nextError);
      }
    } finally {
      if (mounted.current) setIsFetching(false);
    }
  }, [publicKey, token]);

  useEffect(() => {
    if (authLoading) return;
    void refetch();
  }, [authLoading, refetch]);

  return {
    user,
    isLoading: authLoading || isFetching,
    error,
    refetch,
  };
};
