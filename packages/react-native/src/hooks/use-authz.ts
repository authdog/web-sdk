import { useCallback, useState } from "react";
import { useAuthdogContext } from "./use-authdog-context";

/**
 * ⚠️ PRESENTATIONAL ONLY — NOT A SECURITY BOUNDARY.
 *
 * This hook fetches a permission list to drive UI affordances (showing or
 * hiding buttons, tabs, screens, etc.). It runs entirely on the device and is
 * therefore trivially bypassable by anyone who controls the client. It MUST
 * NOT be used to gate access to data or actions.
 *
 * Every protected operation MUST be independently enforced server-side.
 */

export interface UseAuthzOptions {
  /**
   * Absolute URL of the endpoint that returns the current user's permissions.
   * Defaults to "/api/permissions" — note that on native you almost always
   * need a fully-qualified URL. This endpoint is informational only;
   * authorization must still be enforced on every protected server endpoint.
   */
  permissionsUrl?: string;
}

export const useAuthz = (options: UseAuthzOptions = {}) => {
  const context = useAuthdogContext("useAuthz");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const permissionsUrl = options.permissionsUrl ?? "/api/permissions";

  const fetchPermissions = useCallback(async () => {
    if (!context.token) {
      return [];
    }

    setIsLoading(true);
    setError(null);

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
        setPermissions([]);
        throw new Error("Unauthorized: authentication failed (401)");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch permissions (status ${response.status})`,
        );
      }

      const data = (await response.json()) as { permissions?: string[] };
      const next: string[] = data.permissions ?? [];
      setPermissions(next);
      return next;
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [context.token, permissionsUrl]);

  /**
   * ⚠️ PRESENTATIONAL ONLY. Returns whether the locally-cached permission list
   * contains `permission`. For UI hints only and is bypassable; never rely on
   * it as an access-control check. Enforce permissions server-side.
   */
  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (list: string[]) => list.some((p) => permissions.includes(p)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (list: string[]) => list.every((p) => permissions.includes(p)),
    [permissions],
  );

  return {
    permissions,
    isLoading,
    error,
    fetchPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
