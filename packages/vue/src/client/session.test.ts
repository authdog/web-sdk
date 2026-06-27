import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getTokenFromUri,
  validatePublicKey,
  fetchUserData,
  browserCookiesOptions,
} from "./session";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getTokenFromUri", () => {
  it("extracts the token query param", () => {
    expect(getTokenFromUri("https://app.test/cb?token=abc123")).toBe("abc123");
  });

  it("returns null when there is no token param", () => {
    expect(getTokenFromUri("https://app.test/cb?foo=bar")).toBeNull();
  });

  it("decodes percent-encoded token values", () => {
    expect(getTokenFromUri("https://app.test/cb?token=a%20b")).toBe("a b");
  });
});

describe("validatePublicKey", () => {
  it("does not throw for a key with the pk_ prefix", () => {
    expect(() => validatePublicKey("pk_anything")).not.toThrow();
  });

  it("throws when the key is missing", () => {
    expect(() => validatePublicKey("")).toThrow("Public key is not defined");
  });

  it("throws when the key lacks the pk_ prefix", () => {
    expect(() => validatePublicKey("sk_abc")).toThrow("Invalid public key");
  });
});

describe("fetchUserData", () => {
  it("requests the userinfo endpoint with a bearer token", async () => {
    const body = { user: { id: "u1" }, meta: { code: 200, message: "ok" } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => body,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchUserData(TRUSTED_KEY, "tok-123");

    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://identity.authdog.com/oidc/env-123/userinfo",
      { headers: { authorization: "Bearer tok-123" } },
    );
  });

  it("throws when the public key is invalid before fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchUserData("", "tok")).rejects.toThrow(
      "Public key is not defined",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchUserData(TRUSTED_KEY, "tok")).rejects.toThrow(
      "Failed to fetch user info",
    );
  });
});

describe("browserCookiesOptions", () => {
  it("is a one-week, secure, lax, root-path cookie without httpOnly", () => {
    expect(browserCookiesOptions).toEqual({
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      secure: true,
      sameSite: "lax",
    });
    expect("httpOnly" in browserCookiesOptions).toBe(false);
  });
});
