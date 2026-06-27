import { useContext } from "react";
import { AuthdogContext, type AuthdogContextValue } from "../provider";

/**
 * Internal helper: returns the Authdog context or throws a clear error when a
 * hook is used outside `<AuthdogProvider>`. The `hookName` is interpolated so
 * the message points at the offending hook.
 */
export const useAuthdogContext = (hookName: string): AuthdogContextValue => {
  const context = useContext(AuthdogContext);
  if (!context) {
    throw new Error(`${hookName} must be used within AuthdogProvider`);
  }
  return context;
};
