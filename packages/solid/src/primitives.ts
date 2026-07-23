import { createSignal, useContext, type Accessor } from "solid-js";
import { AuthdogContext, type AuthdogContextValue } from "./provider";
import { buildAuthorizeUrl, fetchUser } from "./session";
import { getPublicKeyPayload } from "./commons";

/** Returns the Authdog context, throwing if used outside `AuthdogProvider`. */
export const useAuthdog = (): AuthdogContextValue => {
  const context = useContext(AuthdogContext);
  if (!context) {
    throw new Error("useAuthdog must be used within an AuthdogProvider");
  }
  return context;
};

/** Reactive session state: `token`, `isAuthenticated`, `isLoading`. */
export const useSession = () => {
  const ctx = useAuthdog();
  return {
    token: ctx.token,
    isAuthenticated: ctx.isAuthenticated,
    isLoading: ctx.isLoading,
  };
};

/** Loads the current user from the OIDC `userinfo` endpoint on demand. */
export const useUser = () => {
  const ctx = useAuthdog();
  const [user, setUser] = createSignal<unknown | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);

  const load = async (): Promise<unknown | null> => {
    const token = ctx.token();
    if (!token) return null;
    setIsLoading(true);
    setError(null);
    try {
      const resolved = await fetchUser(ctx.publicKey, token);
      setUser(resolved);
      return resolved;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: user as Accessor<unknown | null>,
    isLoading,
    error,
    load,
  };
};

/** Redirects to the OIDC sign-in flow. */
export const useSignIn = () => {
  const ctx = useAuthdog();
  const signIn = (redirectUri?: string) => {
    if (typeof window === "undefined") return;
    const payload = getPublicKeyPayload(ctx.publicKey);
    window.location.href = buildAuthorizeUrl(payload, ctx.publicKey, {
      redirectUri,
    });
  };
  return { signIn };
};

/** Redirects to the OIDC sign-up flow. */
export const useSignUp = () => {
  const ctx = useAuthdog();
  const signUp = (redirectUri?: string) => {
    if (typeof window === "undefined") return;
    const payload = getPublicKeyPayload(ctx.publicKey);
    window.location.href = buildAuthorizeUrl(payload, ctx.publicKey, {
      redirectUri,
      prompt: "signup",
    });
  };
  return { signUp };
};

/** Clears the session token and optionally navigates afterwards. */
export const useSignOut = () => {
  const ctx = useAuthdog();
  const signOut = (redirectTo?: string) => {
    ctx.setToken(null);
    if (typeof window !== "undefined" && redirectTo) {
      window.location.href = redirectTo;
    }
  };
  return { signOut };
};
