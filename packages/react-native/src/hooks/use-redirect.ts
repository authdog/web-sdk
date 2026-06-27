import { useCallback } from "react";
import { JWT_PATTERN, getTokenFromUri } from "../commons";
import { useAuthdogContext } from "./use-authdog-context";

export const useRedirectHandler = () => {
  const context = useAuthdogContext("useRedirectHandler");

  /**
   * Completes sign-in from a returned deep link (e.g. the URL delivered to
   * `Linking.addEventListener("url", …)` or `Linking.getInitialURL()`).
   *
   * The `?token=` value is validated against the JWT shape BEFORE it is
   * persisted, so an attacker who can craft a deep link cannot get arbitrary
   * data written into secure storage. Returns the token on success, otherwise
   * `null`.
   */
  const handleRedirect = useCallback(
    async (url: string): Promise<string | null> => {
      const token = getTokenFromUri(url);

      // Only persist values that look like a JWT.
      if (!token || !JWT_PATTERN.test(token)) {
        return null;
      }

      await context.setToken(token);
      return token;
    },
    [context],
  );

  return { handleRedirect };
};
