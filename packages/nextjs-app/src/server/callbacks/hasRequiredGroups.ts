import { runIdentityGraphQLRequest } from "./graphql-client"

const PRINCIPAL_GROUPS_QUERY = `
  query PrincipalGroups($groupIds: [String!]) {
    principalGroups(groupId: $groupIds) {
      hasGroups
      missingGroups
      meta {
        code
        message
      }
    }
  }
`

export const hasRequiredGroups = async (
  publicKey: string,
  token: string,
  groups: string[],
) => {
  const data = await runIdentityGraphQLRequest<{
    principalGroups: {
      hasGroups: boolean
      missingGroups: string[]
      meta: { code: number; message: string }
    }
  }>(publicKey, token, PRINCIPAL_GROUPS_QUERY, {
    groupIds: groups || [],
  })

  return data.principalGroups
}