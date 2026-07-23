import { computed, inject, ref } from "vue";
import {
  AUTHDOG_CONTEXT_KEY,
  type AuthdogContext,
} from "../client/context";
import { buildAuthorizeUrl, fetchUser } from "../client/session";
import { getPublicKeyPayload } from "../commons";

const useContext = (name: string): AuthdogContext => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY);
  if (!context) {
    throw new Error(`${name} must be used with the Authdog Nuxt plugin installed`);
  }
  return context;
};

/** Reactive session state: `session` (token + isAuthenticated) and `isLoading`. */
export const useSession = () => {
  const context = useContext("useSession");
  return {
    session: computed(() => ({
      token: context.token,
      isAuthenticated: !!context.token,
    })),
    isLoading: computed(() => context.isLoading),
  };
};

/** Loads the current user from the OIDC `userinfo` endpoint on demand. */
export const useUser = () => {
  const context = useContext("useUser");
  const user = ref<unknown | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const load = async (): Promise<unknown | null> => {
    if (!context.token) return null;
    isLoading.value = true;
    error.value = null;
    try {
      const resolved = await fetchUser(context.publicKey, context.token);
      user.value = resolved;
      return resolved;
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAuthenticated: computed(() => !!context.token && !!user.value),
    load,
  };
};

/** Redirects to the OIDC sign-in flow. */
export const useSignIn = () => {
  const context = useContext("useSignIn");
  const signIn = (redirectUri?: string) => {
    if (typeof window === "undefined") return;
    const payload = getPublicKeyPayload(context.publicKey);
    window.location.href = buildAuthorizeUrl(payload, context.publicKey, {
      redirectUri,
    });
  };
  return { signIn };
};

/** Redirects to the OIDC sign-up flow. */
export const useSignUp = () => {
  const context = useContext("useSignUp");
  const signUp = (redirectUri?: string) => {
    if (typeof window === "undefined") return;
    const payload = getPublicKeyPayload(context.publicKey);
    window.location.href = buildAuthorizeUrl(payload, context.publicKey, {
      redirectUri,
      prompt: "signup",
    });
  };
  return { signUp };
};

/** Clears the session token and optionally navigates afterwards. */
export const useSignOut = () => {
  const context = useContext("useSignOut");
  const signOut = (redirectTo?: string) => {
    context.setToken(null);
    if (typeof window !== "undefined" && redirectTo) {
      window.location.href = redirectTo;
    }
  };
  return { signOut };
};
