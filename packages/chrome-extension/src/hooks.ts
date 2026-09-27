import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authenticate, fetchUser, type AuthdogUser } from "./auth";
import { AuthdogContext } from "./provider";

const useAuthdogContext = (hook: string) => {
  const context = useContext(AuthdogContext);
  if (!context) {
    throw new Error(`${hook} must be used inside an AuthdogProvider`);
  }
  return context;
};

export const useSession = () => {
  const { token, isLoading } = useAuthdogContext("useSession");
  const session = useMemo(
    () => ({ token, isAuthenticated: Boolean(token) }),
    [token],
  );
  return { session, isLoading };
};

const useAuthentication = (signup: boolean) => {
  const context = useAuthdogContext(signup ? "useSignUp" : "useSignIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await authenticate(context.publicKey, signup);
      await context.setToken(token);
      return token;
    } catch (cause) {
      const nextError =
        cause instanceof Error ? cause : new Error("Authentication failed");
      setError(nextError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context, signup]);

  return { run, isLoading, error };
};

export const useSignIn = () => {
  const { run, ...state } = useAuthentication(false);
  return { signIn: run, ...state };
};

export const useSignUp = () => {
  const { run, ...state } = useAuthentication(true);
  return { signUp: run, ...state };
};

export const useSignOut = () => {
  const context = useAuthdogContext("useSignOut");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await context.setToken(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Sign out failed"));
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  return { signOut, isLoading, error };
};

export const useUser = () => {
  const context = useAuthdogContext("useUser");
  const [user, setUser] = useState<AuthdogUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!context.token) {
      setUser(null);
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const nextUser = await fetchUser(context.publicKey, context.token);
      setUser(nextUser);
      return nextUser;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause : new Error("Failed to fetch user"),
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context.publicKey, context.token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    user,
    isLoading: context.isLoading || isLoading,
    isAuthenticated: Boolean(context.token),
    error,
    reload,
  };
};
