import { describe, it, expect, vi, beforeEach } from "vitest"
import { hasRequiredPermissions } from "./hasRequiredPermissions"
import { runIdentityGraphQLRequest } from "./graphql-client"

vi.mock("./graphql-client", () => ({
  runIdentityGraphQLRequest: vi.fn(),
}))

const mockRunRequest = vi.mocked(runIdentityGraphQLRequest)

const buildPublicKey = () => {
  const payload = {
    identityHost: "https://identity.example.com/",
    environmentId: "env-123",
  }
  return `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`
}

describe("hasRequiredPermissions", () => {
  beforeEach(() => {
    mockRunRequest.mockReset()
  })

  it("queries principalPermissions with permission ids and returns the response", async () => {
    const expectedResponse = {
      principalPermissions: {
        hasPermissions: false,
        missingPermissions: ["users:delete"],
        meta: { code: 200, message: "Success" },
      },
    }
    mockRunRequest.mockResolvedValueOnce(expectedResponse)

    const publicKey = buildPublicKey()
    const token = "token-abc"
    const permissions = ["users:read", "roles:edit"]

    const response = await hasRequiredPermissions(publicKey, token, permissions)

    expect(mockRunRequest).toHaveBeenCalledWith(
      publicKey,
      token,
      expect.stringContaining("principalPermissions"),
      { permissionIds: permissions },
    )
    expect(response).toEqual(expectedResponse.principalPermissions)
  })
})

