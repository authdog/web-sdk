import { useMemo } from "react";
import { useAuthdogContext } from "./use-authdog-context";

export const useSession = () => {
  const context = useAuthdogContext("useSession");

  const session = useMemo(
    () => ({
      token: context.token,
      isAuthenticated: !!context.token,
    }),
    [context.token],
  );

  return {
    session,
    isLoading: context.isLoading,
  };
};
