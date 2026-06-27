import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchUserData, isAuthenticatedUserInfo } from "./identity";

const TRUSTED_HOST = "https://identity.authdog.com";

const mockResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as unknown as Response;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("fetchUserData", () => {
  it("calls the userinfo endpoint of a trusted host with the bearer token", async () => {
    const body = { user: { id: "u1" }, meta: { code: 200 } };
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(body));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchUserData(TRUSTED_HOST, "env 1", "tok-123");

    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      `${TRUSTED_HOST}/oidc/env%201/userinfo`,
      { headers: { authorization: "Bearer tok-123" } },
    );
  });

  it("url-encodes the environment id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({}));
    vi.stubGlobal("fetch", fetchMock);

    await fetchUserData(TRUSTED_HOST, "a/b?c", "tok");

    expect(fetchMock).toHaveBeenCalledWith(
      `${TRUSTED_HOST}/oidc/a%2Fb%3Fc/userinfo`,
      expect.anything(),
    );
  });

  it("rejects untrusted hosts before issuing the request (SSRF / token exfiltration)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchUserData("https://evil.com", "env-1", "tok"),
    ).rejects.toThrow("Untrusted identity host");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when the response is not ok", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse({}, false, 503));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchUserData(TRUSTED_HOST, "env-1", "tok"),
    ).rejects.toThrow("Failed to fetch user info (status 503)");
  });
});

describe("isAuthenticatedUserInfo", () => {
  it("returns true only for a 200 envelope with a user", () => {
    expect(
      isAuthenticatedUserInfo({ user: { id: "u1" }, meta: { code: 200 } }),
    ).toBe(true);
  });

  it("returns false when meta.code is not 200", () => {
    expect(
      isAuthenticatedUserInfo({ user: { id: "u1" }, meta: { code: 401 } }),
    ).toBe(false);
  });

  it("returns false when the user is missing even with a 200 code", () => {
    expect(isAuthenticatedUserInfo({ meta: { code: 200 } })).toBe(false);
  });

  it("returns false for null / undefined / empty input", () => {
    expect(isAuthenticatedUserInfo(null)).toBe(false);
    expect(isAuthenticatedUserInfo(undefined)).toBe(false);
    expect(isAuthenticatedUserInfo({})).toBe(false);
  });
});
