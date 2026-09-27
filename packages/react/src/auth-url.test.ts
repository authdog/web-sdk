import { describe, expect, it } from "vitest";
import { buildAuthorizeUrl } from "./auth-url";

const makePk = (payload: Record<string, unknown>) =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

describe("buildAuthorizeUrl", () => {
  it("builds OIDC authorize URL from public key", () => {
    const publicKey = makePk({
      environmentId: "env_123",
      identityHost: "https://id.authdog.com",
    });

    const url = buildAuthorizeUrl(publicKey, {
      redirectUrl: "https://app.example.com/callback",
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://id.authdog.com");
    expect(parsed.pathname).toBe("/oidc/env_123/authorize");
    expect(parsed.searchParams.get("client_id")).toBe(publicKey);
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "https://app.example.com/callback",
    );
    expect(parsed.searchParams.get("scope")).toBe("openid profile email");
  });

  it("adds signup prompt when requested", () => {
    const publicKey = makePk({
      environmentId: "env_123",
      identityHost: "https://id.authdog.com",
    });

    const url = buildAuthorizeUrl(publicKey, {
      redirectUrl: "https://app.example.com",
      signup: true,
    });

    expect(new URL(url).searchParams.get("prompt")).toBe("signup");
  });
});
