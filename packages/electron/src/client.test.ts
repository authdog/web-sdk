import { describe, expect, it } from "vitest";
import { createAuthdogClient, type TokenStorage } from "./client";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});

const memoryStorage = (): TokenStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
};

describe("createAuthdogClient", () => {
  it("opens the system browser with the authorize URL", async () => {
    const opened: string[] = [];
    const client = createAuthdogClient({
      publicKey: TRUSTED_KEY,
      redirectUri: "myapp://auth/callback",
      openUrl: (url) => {
        opened.push(url);
      },
      storage: memoryStorage(),
    });

    await client.signIn();
    const url = new URL(opened[0]);
    expect(url.pathname).toBe("/oidc/env-123/authorize");
    expect(url.searchParams.get("redirect_uri")).toBe("myapp://auth/callback");
    expect(await client.isAuthenticated()).toBe(false);
  });

  it("persists a JWT-shaped callback token and clears it on sign-out", async () => {
    const client = createAuthdogClient({
      publicKey: TRUSTED_KEY,
      redirectUri: "myapp://auth/callback",
      openUrl: () => undefined,
      storage: memoryStorage(),
    });

    expect(
      await client.handleCallback("myapp://auth/callback?token=not-a-jwt"),
    ).toBeNull();
    expect(await client.isAuthenticated()).toBe(false);

    const token = await client.handleCallback(
      "myapp://auth/callback?token=aaa.bbb.ccc",
    );
    expect(token).toBe("aaa.bbb.ccc");
    expect(await client.getToken()).toBe("aaa.bbb.ccc");

    await client.signOut();
    expect(await client.getToken()).toBeNull();
  });

  it("rejects an untrusted public key at construction", () => {
    const key = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    expect(() =>
      createAuthdogClient({
        publicKey: key,
        redirectUri: "myapp://auth/callback",
      }),
    ).toThrow("Untrusted identity host");
  });
});
