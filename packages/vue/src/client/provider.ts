import {
  defineComponent,
  onMounted,
  ref,
  provide,
  type InjectionKey,
} from "vue";

export interface AuthdogContext {
  readonly isLoading: boolean;
  readonly token: string | null;
  setToken: (token: string | null) => void;
}

export const AUTHDOG_CONTEXT_KEY: InjectionKey<AuthdogContext> =
  Symbol("authdog");

/** Shared localStorage key for the persisted token. */
export const TOKEN_STORAGE_KEY = "token";

/** JWT shape: three base64url segments separated by dots. */
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const AuthdogProvider = defineComponent({
  name: "AuthdogProvider",
  setup(_, { slots }) {
    const isLoading = ref(true);
    const token = ref<string | null>(null);

    const setToken = (newToken: string | null) => {
      token.value = newToken;
    };

    onMounted(() => {
      // Check if we're in the browser
      if (typeof window !== "undefined") {
        // Check if there's a token in the URL
        const url = new URL(window.location.href);
        const urlToken = url.searchParams.get("token");

        if (urlToken) {
          // Remove token from URL without triggering a page reload,
          // regardless of whether the token is valid.
          url.searchParams.delete("token");
          window.history.replaceState({}, document.title, url.toString());

          // Only persist values that look like a JWT to avoid storing
          // arbitrary attacker-supplied data.
          if (JWT_PATTERN.test(urlToken)) {
            localStorage.setItem(TOKEN_STORAGE_KEY, urlToken);
            setToken(urlToken);

            // Force a reload to ensure the server processes the token
            window.location.reload();
            return;
          }
        }

        // Check for existing token in localStorage
        const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (existingToken) {
          setToken(existingToken);
        }

        // If no token, we're done loading
        isLoading.value = false;
      } else {
        // If we're on the server, don't show loading state
        isLoading.value = false;
      }
    });

    // Expose reactive state through getters so consumers always read the
    // live ref values rather than a frozen snapshot taken at setup time.
    const context: AuthdogContext = {
      get isLoading() {
        return isLoading.value;
      },
      get token() {
        return token.value;
      },
      setToken,
    };

    provide(AUTHDOG_CONTEXT_KEY, context);

    return () => slots.default?.();
  },
});
