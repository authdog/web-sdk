import { describe, it, expect } from "vitest";
import { getPublicKeyPayload } from "./commons";
import {
  buildAuthorizeUrl,
  extractTokenFromRedirect,
  isJwtShaped,
} from "./session";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});
const payload = getPublicKeyPayload(TRUSTED_KEY);

describe("buildAuthorizeUrl", () => {
  it("builds the authorize URL with the deep-link redirect URI", () => {
    const url = new URL(
      buildAuthorizeUrl(payload, TRUSTED_KEY, {
        redirectUri: "myapp://auth/callback",
      }),
    );
    expect(url.origin + url.pathname).toBe(
      "https://identity.authdog.com/oidc/env-123/authorize",
    );
    expect(url.searchParams.get("client_id")).toBe(TRUSTED_KEY);
    expect(url.searchParams.get("redirect_uri")).toBe("myapp://auth/callback");
  });

  it("adds prompt=signup when requested", () => {
    const url = new URL(
      buildAuthorizeUrl(payload, TRUSTED_KEY, {
        redirectUri: "myapp://auth/callback",
        prompt: "signup",
      }),
    );
    expect(url.searchParams.get("prompt")).toBe("signup");
  });
});

describe("extractTokenFromRedirect", () => {
  it("reads the token from a custom-scheme query string", () => {
    expect(
      extractTokenFromRedirect("myapp://auth/callback?token=aaa.bbb.ccc"),
    ).toBe("aaa.bbb.ccc");
  });

  it("reads the token from the fragment", () => {
    expect(
      extractTokenFromRedirect("myapp://auth/callback#token=aaa.bbb.ccc&state=x"),
    ).toBe("aaa.bbb.ccc");
  });

  it("returns null when no token is present", () => {
    expect(
      extractTokenFromRedirect("myapp://auth/callback?error=denied"),
    ).toBeNull();
  });
});

describe("isJwtShaped", () => {
  it("accepts a three-segment base64url token", () => {
    expect(isJwtShaped("aaa.bbb.ccc")).toBe(true);
  });

  it("rejects arbitrary strings", () => {
    expect(isJwtShaped("nope")).toBe(false);
  });
});
