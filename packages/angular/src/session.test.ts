import { describe, it, expect } from "vitest";
import {
  JWT_PATTERN,
  TOKEN_STORAGE_KEY,
  buildAuthorizeUrl,
  getTokenFromUri,
} from "./session";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});

describe("TOKEN_STORAGE_KEY", () => {
  it("is the shared localStorage key", () => {
    expect(TOKEN_STORAGE_KEY).toBe("token");
  });
});

describe("JWT_PATTERN", () => {
  it("matches a three-segment base64url JWT", () => {
    expect(JWT_PATTERN.test("aGVhZGVy.cGF5bG9hZA.c2ln_-")).toBe(true);
  });

  it("rejects a value with fewer than three segments", () => {
    expect(JWT_PATTERN.test("aGVhZGVy.cGF5bG9hZA")).toBe(false);
  });

  it("rejects segments containing illegal characters", () => {
    expect(JWT_PATTERN.test("hea der.payload.sig")).toBe(false);
    expect(JWT_PATTERN.test("header.pay+load.sig")).toBe(false);
  });
});

describe("getTokenFromUri", () => {
  it("extracts the token query parameter", () => {
    expect(getTokenFromUri("https://app.example.com/cb?token=abc.def.ghi")).toBe(
      "abc.def.ghi",
    );
  });

  it("returns null when there is no token parameter", () => {
    expect(getTokenFromUri("https://app.example.com/cb?other=1")).toBeNull();
  });

  it("decodes percent-encoded token values", () => {
    expect(getTokenFromUri("https://app.example.com/cb?token=a%2Bb")).toBe(
      "a+b",
    );
  });
});

describe("buildAuthorizeUrl", () => {
  it("builds the OIDC authorize URL with the expected query params", () => {
    const url = new URL(buildAuthorizeUrl(TRUSTED_KEY, "https://app/cb"));

    expect(url.origin).toBe("https://identity.authdog.com");
    expect(url.pathname).toBe("/oidc/env-123/authorize");
    expect(url.searchParams.get("client_id")).toBe(TRUSTED_KEY);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid profile email");
    expect(url.searchParams.get("redirect_uri")).toBe("https://app/cb");
    expect(url.searchParams.has("prompt")).toBe(false);
  });

  it("adds prompt=signup when the signup option is set", () => {
    const url = new URL(
      buildAuthorizeUrl(TRUSTED_KEY, "https://app/cb", { signup: true }),
    );
    expect(url.searchParams.get("prompt")).toBe("signup");
  });

  it("throws on an empty public key", () => {
    expect(() => buildAuthorizeUrl("", "https://app/cb")).toThrow(
      "Public key is not defined",
    );
  });

  it("rejects a public key pointing at an untrusted identity host", () => {
    const key = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    expect(() => buildAuthorizeUrl(key, "https://app/cb")).toThrow(
      "Untrusted identity host",
    );
  });
});
