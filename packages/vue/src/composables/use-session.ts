import { computed, inject } from "vue";
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from "../client/provider";

export const useSession = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY);

  if (!context) {
    throw new Error("useSession must be used within AuthdogProvider");
  }

  const session = computed(() => ({
    token: context.token,
    isAuthenticated: !!context.token,
  }));

  return {
    session,
    isLoading: computed(() => context.isLoading),
  };
};
