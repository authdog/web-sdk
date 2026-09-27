import { describe, it, expect } from "vitest";
import { getPublicKeyPayload } from "./commons";
import { buildAuthorizeUrl, getTokenFromUri, isJwtShaped } from "./session";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});
const payload = getPublicKeyPayload(TRUSTED_KEY);

describe("getTokenFromUri", () => {
  it("extracts the token query param", () => {
    expect(getTokenFromUri("https://app.test/cb?token=abc123")).toBe("abc123");
  });

  it("returns null when there is no token param", () => {
    expect(getTokenFromUri("https://app.test/cb?foo=bar")).toBeNull();
  });
});

describe("isJwtShaped", () => {
  it("accepts a three-segment base64url token", () => {
    expect(isJwtShaped("aaa.bbb.ccc")).toBe(true);
  });

  it("rejects arbitrary strings", () => {
    expect(isJwtShaped("not-a-jwt")).toBe(false);
  });
});

describe("buildAuthorizeUrl", () => {
  it("builds the authorize URL with the OIDC params", () => {
    const url = new URL(
      buildAuthorizeUrl(payload, TRUSTED_KEY, {
        redirectUri: "https://app.test/cb",
      }),
    );
    expect(url.origin + url.pathname).toBe(
      "https://identity.authdog.com/oidc/env-123/authorize",
    );
    expect(url.searchParams.get("client_id")).toBe(TRUSTED_KEY);
    expect(url.searchParams.get("scope")).toBe("openid profile email");
    expect(url.searchParams.get("redirect_uri")).toBe("https://app.test/cb");
  });

  it("adds prompt=signup when requested", () => {
    const url = new URL(
      buildAuthorizeUrl(payload, TRUSTED_KEY, {
        redirectUri: "https://app.test/cb",
        prompt: "signup",
      }),
    );
    expect(url.searchParams.get("prompt")).toBe("signup");
  });
});
