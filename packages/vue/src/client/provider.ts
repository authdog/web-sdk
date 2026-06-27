import {
  defineComponent,
  onMounted,
  ref,
  provide,
  type InjectionKey,
} from "vue";

export interface AuthdogContext {
  isLoading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AUTHDOG_CONTEXT_KEY: InjectionKey<AuthdogContext> =
  Symbol("authdog");

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
          // Remove token from URL without triggering a page reload
          url.searchParams.delete("token");
          window.history.replaceState({}, document.title, url.toString());

          // Store token and reload to ensure server processes it
          localStorage.setItem("token", urlToken);
          setToken(urlToken);

          // Force a reload to ensure the server processes the token
          window.location.reload();
          return;
        }

        // Check for existing token in localStorage
        const existingToken = localStorage.getItem("token");
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

    const context: AuthdogContext = {
      isLoading: isLoading.value,
      token: token.value,
      setToken,
    };

    provide(AUTHDOG_CONTEXT_KEY, context);

    return () => slots.default?.();
  },
});
