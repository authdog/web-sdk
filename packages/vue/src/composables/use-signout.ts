import { ref, computed, inject } from "vue";
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from "../client/provider";

export const useSignOut = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  if (!context) {
    throw new Error("useSignOut must be used within AuthdogProvider");
  }

  const signOut = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Clear token from context
      context.setToken(null);

      // Clear token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      // Redirect to logout endpoint or home page
      if (typeof window !== "undefined") {
        window.location.href = "/logout";
      }
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    signOut,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
  };
};
