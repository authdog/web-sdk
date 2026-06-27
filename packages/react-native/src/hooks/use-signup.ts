import { useCallback, useState } from "react";
import { Linking } from "react-native";
import { buildAuthorizeUrl } from "../auth-url";
import { useAuthdogContext } from "./use-authdog-context";

export const useSignUp = () => {
  const context = useAuthdogContext("useSignUp");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Opens the hosted sign-up flow (`prompt=signup`) in the system browser.
   * `redirectUrl` MUST be a deep link registered by your app.
   */
  const signUp = useCallback(
    async (redirectUrl: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const authUrl = buildAuthorizeUrl(context.publicKey, {
          redirectUrl,
          signup: true,
        });
        await Linking.openURL(authUrl);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [context.publicKey],
  );

  return { signUp, isLoading, error };
};
