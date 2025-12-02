import { ref, computed, inject } from "vue";
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from "../client/provider";

export const useAuthz = () => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY);
  const permissions = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  if (!context) {
    throw new Error("useAuthz must be used within AuthdogProvider");
  }

  const fetchPermissions = async () => {
    if (!context.token) {
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      // This would be implemented based on your authorization API
      // For now, returning a placeholder
      const response = await fetch("/api/permissions", {
        headers: {
          Authorization: `Bearer ${context.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      const data = await response.json();
      permissions.value = data.permissions || [];
      return permissions.value;
    } catch (err) {
      error.value = err as Error;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some((permission) =>
      permissions.value.includes(permission),
    );
  };

  const hasAllPermissions = (permissionList: string[]) => {
    return permissionList.every((permission) =>
      permissions.value.includes(permission),
    );
  };

  return {
    permissions: computed(() => permissions.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
