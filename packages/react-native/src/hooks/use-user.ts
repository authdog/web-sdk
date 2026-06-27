import { useCallback, useState } from "react";
import { fetchUserData, validatePublicKey } from "../session";
import { useAuthdogContext } from "./use-authdog-context";

export const useUser = () => {
  const context = useAuthdogContext("useUser");
  const [user, setUser] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // The public key is supplied to the provider, so callers don't need to pass
  // it again — it is read from context.
  const fetchUser = useCallback(async () => {
    if (!context.token) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      validatePublicKey(context.publicKey);
      const userData = await fetchUserData(context.publicKey, context.token);
      const nextUser = userData?.user ?? null;
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context.publicKey, context.token]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!context.token && !!user,
    fetchUser,
  };
};
