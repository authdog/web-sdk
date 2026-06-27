import { useCallback, useState } from "react";
import { Linking } from "react-native";
import { buildAuthorizeUrl } from "../auth-url";
import { useAuthdogContext } from "./use-authdog-context";

export const useSignIn = () => {
  const context = useAuthdogContext("useSignIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Opens the hosted sign-in flow in the system browser. `redirectUrl` MUST be
   * a deep link registered by your app (e.g. `myapp://callback`) so the
   * identity server can return the user — pass it to `handleRedirect` to
   * complete sign-in.
   */
  const signIn = useCallback(
    async (redirectUrl: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const authUrl = buildAuthorizeUrl(context.publicKey, { redirectUrl });
        await Linking.openURL(authUrl);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [context.publicKey],
  );

  return { signIn, isLoading, error };
};
