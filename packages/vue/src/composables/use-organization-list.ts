import { ref, computed, inject } from "vue";
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from "../client/provider";

export const useOrganizationList = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY);
  const organizations = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  if (!context) {
    throw new Error("useOrganizationList must be used within AuthdogProvider");
  }

  const fetchOrganizations = async () => {
    if (!context.token) {
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      // This would be implemented based on your organizations API
      // For now, returning a placeholder
      const response = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${context.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();
      organizations.value = data.organizations || [];
      return organizations.value;
    } catch (err) {
      error.value = err as Error;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    organizations: computed(() => organizations.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchOrganizations,
  };
};
