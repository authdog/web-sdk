import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticate, buildAuthorizeUrl, getTokenFromUrl } from "./auth";

const publicKey = `pk_${Buffer.from(
  JSON.stringify({
    environmentId: "env-123",
    identityHost: "https://identity.authdog.com",
  }),
).toString("base64")}`;

afterEach(() => vi.unstubAllGlobals());

describe("buildAuthorizeUrl", () => {
  it("builds an authorize request for a trusted Authdog identity host", () => {
    const url = new URL(
      buildAuthorizeUrl(
        publicKey,
        "https://extension-id.chromiumapp.org/authdog",
      ),
    );
    expect(url.pathname).toBe("/oidc/env-123/authorize");
    expect(url.searchParams.get("client_id")).toBe(publicKey);
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://extension-id.chromiumapp.org/authdog",
    );
  });

  it("adds the signup prompt when requested", () => {
    const url = new URL(buildAuthorizeUrl(publicKey, "https://callback", true));
    expect(url.searchParams.get("prompt")).toBe("signup");
  });

  it("rejects untrusted identity hosts", () => {
    const key = `pk_${Buffer.from(
      JSON.stringify({
        environmentId: "env-123",
        identityHost: "https://attacker.example",
      }),
    ).toString("base64")}`;
    expect(() => buildAuthorizeUrl(key, "https://callback")).toThrow(
      "Untrusted identity host",
    );
  });
});

describe("authenticate", () => {
  it("returns a validated token from launchWebAuthFlow", async () => {
    const token = "header.payload.signature";
    vi.stubGlobal("chrome", {
      identity: {
        getRedirectURL: () => "https://extension-id.chromiumapp.org/authdog",
        launchWebAuthFlow: (
          _details: unknown,
          callback: (url: string) => void,
        ) =>
          callback(
            `https://extension-id.chromiumapp.org/authdog?token=${token}`,
          ),
      },
      runtime: {},
      storage: { local: {} },
    });

    await expect(authenticate(publicKey)).resolves.toBe(token);
  });

  it("rejects malformed session tokens", async () => {
    vi.stubGlobal("chrome", {
      identity: {
        getRedirectURL: () => "https://extension-id.chromiumapp.org/authdog",
        launchWebAuthFlow: (
          _details: unknown,
          callback: (url: string) => void,
        ) =>
          callback(
            "https://extension-id.chromiumapp.org/authdog?token=not-a-jwt",
          ),
      },
      runtime: {},
      storage: { local: {} },
    });

    await expect(authenticate(publicKey)).rejects.toThrow(
      "invalid session token",
    );
  });
});

describe("getTokenFromUrl", () => {
  it("returns null for malformed URLs", () => {
    expect(getTokenFromUrl("not a url")).toBeNull();
  });
});
