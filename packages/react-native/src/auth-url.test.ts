import { describe, it, expect } from "vitest";
import { buildAuthorizeUrl } from "./auth-url";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const validKey = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com/",
});

describe("buildAuthorizeUrl", () => {
  it("targets the validated identity host and environment authorize endpoint", () => {
    const url = new URL(buildAuthorizeUrl(validKey, { redirectUrl: "myapp://callback" }));

    expect(url.origin).toBe("https://identity.authdog.com");
    expect(url.pathname).toBe("/oidc/env-123/authorize");
  });

  it("sets the OIDC query parameters", () => {
    const url = new URL(buildAuthorizeUrl(validKey, { redirectUrl: "myapp://callback" }));

    expect(url.searchParams.get("client_id")).toBe(validKey);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid profile email");
    expect(url.searchParams.get("redirect_uri")).toBe("myapp://callback");
  });

  it("omits the signup prompt by default", () => {
    const url = new URL(buildAuthorizeUrl(validKey, { redirectUrl: "myapp://callback" }));
    expect(url.searchParams.has("prompt")).toBe(false);
  });

  it("adds prompt=signup only when signup is true", () => {
    const url = new URL(
      buildAuthorizeUrl(validKey, { redirectUrl: "myapp://callback", signup: true }),
    );
    expect(url.searchParams.get("prompt")).toBe("signup");
  });

  it("rejects public keys pointing at untrusted identity hosts", () => {
    const key = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    expect(() => buildAuthorizeUrl(key, { redirectUrl: "myapp://callback" })).toThrow(
      "Untrusted identity host",
    );
  });

  it("throws on an invalid public key", () => {
    expect(() => buildAuthorizeUrl("nope", { redirectUrl: "myapp://callback" })).toThrow(
      "Invalid public key",
    );
  });
});
