import { runIdentityGraphQLRequest } from "./graphql-client";

const PRINCIPAL_PERMISSIONS_QUERY = `
  query PrincipalPermissions($permissionIds: [String!]) {
    principalPermissions(permissionId: $permissionIds) {
      hasPermissions
      missingPermissions
      meta {
        code
        message
      }
    }
  }
`;

export const hasRequiredPermissions = async (
  publicKey: string,
  token: string,
  permissions: string[],
) => {
  const data = await runIdentityGraphQLRequest<{
    principalPermissions: {
      hasPermissions: boolean;
      missingPermissions: string[];
      meta: { code: number; message: string };
    };
  }>(publicKey, token, PRINCIPAL_PERMISSIONS_QUERY, {
    permissionIds: permissions || [],
  });

  return data.principalPermissions;
};
