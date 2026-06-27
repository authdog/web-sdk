import { ref, computed, inject } from "vue";
import { AUTHDOG_CONTEXT_KEY, type AuthdogContext } from "../client/provider";

/**
 * ⚠️ PRESENTATIONAL ONLY — NOT A SECURITY BOUNDARY.
 *
 * This composable fetches a permission list to drive UI affordances (showing
 * or hiding buttons, menu items, etc.). It runs entirely in the browser and
 * is therefore trivially bypassable by any client. It MUST NOT be used to
 * gate access to data or actions.
 *
 * Every protected operation MUST be independently enforced server-side.
 */

export interface UseAuthzOptions {
  /**
   * URL of the endpoint that returns the current user's permissions.
   * Defaults to "/api/permissions". This endpoint is informational only;
   * authorization must still be enforced on every protected server endpoint.
   */
  permissionsUrl?: string;
}

export const useAuthz = (options: UseAuthzOptions = {}) => {
  const context = inject<AuthdogContext>(AUTHDOG_CONTEXT_KEY);
  const permissions = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  if (!context) {
    throw new Error("useAuthz must be used within AuthdogProvider");
  }

  const permissionsUrl = options.permissionsUrl ?? "/api/permissions";

  const fetchPermissions = async () => {
    if (!context.token) {
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(permissionsUrl, {
        headers: {
          Authorization: `Bearer ${context.token}`,
        },
      });

      // Distinguish an authentication failure from an empty permission list.
      // A 401 means the session is invalid/expired and should surface as an
      // error rather than being silently coerced into "no permissions".
      if (response.status === 401) {
        permissions.value = [];
        throw new Error("Unauthorized: authentication failed (401)");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch permissions (status ${response.status})`,
        );
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

  /**
   * ⚠️ PRESENTATIONAL ONLY. Returns whether the locally-cached permission
   * list contains `permission`. This is for UI hints only and is bypassable;
   * never rely on it as an access-control check. Enforce permissions
   * server-side for every protected operation.
   */
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
