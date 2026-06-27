import { useCallback, useState } from "react";
import { useAuthdogContext } from "./use-authdog-context";

export const useSignOut = () => {
  const context = useAuthdogContext("useSignOut");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Clears the session token from both in-memory state and the backing
   * storage. There is no browser to redirect on native, so callers are
   * responsible for any post-sign-out navigation.
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await context.setToken(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  return { signOut, isLoading, error };
};
