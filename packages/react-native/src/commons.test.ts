import { describe, it, expect } from "vitest";
import { getPublicKeyPayload, getTokenFromUri, JWT_PATTERN } from "./commons";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

describe("getPublicKeyPayload", () => {
  it("decodes and validates a public key via the shared parser", () => {
    const key = encodePublicKey({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com/",
    });

    expect(getPublicKeyPayload(key)).toEqual({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com",
    });
  });

  it("rejects public keys pointing at untrusted identity hosts", () => {
    const key = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    expect(() => getPublicKeyPayload(key)).toThrow("Untrusted identity host");
  });

  it("throws on an invalid public key", () => {
    expect(() => getPublicKeyPayload("nope")).toThrow("Invalid public key");
  });
});

describe("getTokenFromUri", () => {
  it("extracts the token query parameter", () => {
    expect(getTokenFromUri("myapp://callback?token=abc123")).toBe("abc123");
  });

  it("returns null when no token is present", () => {
    expect(getTokenFromUri("myapp://callback?code=xyz")).toBeNull();
  });

  it("returns null for a malformed URL", () => {
    expect(getTokenFromUri("not a url")).toBeNull();
  });
});

describe("JWT_PATTERN", () => {
  it("matches a three-segment base64url token", () => {
    expect(JWT_PATTERN.test("aGVhZGVy.cGF5bG9hZA.c2ln-_")).toBe(true);
  });

  it("rejects tokens that are not three dot-separated segments", () => {
    expect(JWT_PATTERN.test("onlyone")).toBe(false);
    expect(JWT_PATTERN.test("two.parts")).toBe(false);
    expect(JWT_PATTERN.test("a.b.c.d")).toBe(false);
  });
});
