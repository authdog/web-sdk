import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runIdentityGraphQLRequest } from "./graphql-client";

const buildPublicKey = () => {
  const payload = {
    identityHost: "https://identity.authdog.com/",
    environmentId: "env-123",
  };

  return `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;
};

const makeMockResponse = (body: string, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => body,
});

describe("runIdentityGraphQLRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a POST to the GraphQL endpoint with headers and body", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        makeMockResponse(JSON.stringify({ data: { result: "ok" } })),
      );
    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

    const publicKey = buildPublicKey();
    const token = "token-123";
    const query = "query { hello }";
    const variables = { foo: "bar" };

    const result = await runIdentityGraphQLRequest<{ result: string }>(
      publicKey,
      token,
      query,
      variables,
    );

    expect(result).toEqual({ result: "ok" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://identity.authdog.com/edge/env-123/graphql",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query, variables }),
        headers: expect.objectContaining({
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        }),
      }),
    );
  });

  it("throws when the response status is not ok", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        makeMockResponse(
          JSON.stringify({ errors: [{ message: "failed" }] }),
          false,
          500,
        ),
      );
    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

    await expect(
      runIdentityGraphQLRequest(buildPublicKey(), "token", "query {}", {}),
    ).rejects.toThrow("failed");
  });

  it("throws when the response body cannot be parsed", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(makeMockResponse("not-json", true, 200));
    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

    await expect(
      runIdentityGraphQLRequest(buildPublicKey(), "token", "query {}", {}),
    ).rejects.toThrow("Failed to parse GraphQL response");
  });
});
