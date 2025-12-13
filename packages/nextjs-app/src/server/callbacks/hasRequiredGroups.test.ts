import { describe, it, expect, vi, beforeEach } from "vitest"
import { hasRequiredGroups } from "./hasRequiredGroups"
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

describe("hasRequiredGroups", () => {
  beforeEach(() => {
    mockRunRequest.mockReset()
  })

  it("queries principalGroups with group ids and returns the response", async () => {
    const expectedResponse = {
      principalGroups: {
        hasGroups: true,
        missingGroups: [],
        meta: { code: 200, message: "Success" },
      },
    }
    mockRunRequest.mockResolvedValueOnce(expectedResponse)

    const publicKey = buildPublicKey()
    const token = "token-123"
    const groups = ["group:A", "group:B"]

    const response = await hasRequiredGroups(publicKey, token, groups)

    expect(mockRunRequest).toHaveBeenCalledWith(
      publicKey,
      token,
      expect.stringContaining("principalGroups"),
      { groupIds: groups },
    )
    expect(response).toEqual(expectedResponse.principalGroups)
  })
})

