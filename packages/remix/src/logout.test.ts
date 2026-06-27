import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { logoutLoader } from "./logout";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});

const callLoader = () =>
  logoutLoader({
    request: new Request("https://app.test/logout"),
    context: {},
    params: {},
  });

describe("logoutLoader", () => {
  const originalPk = process.env.PK_AUTHDOG;

  beforeEach(() => {
    process.env.PK_AUTHDOG = TRUSTED_KEY;
  });

  afterEach(() => {
    if (originalPk === undefined) delete process.env.PK_AUTHDOG;
    else process.env.PK_AUTHDOG = originalPk;
  });

  it("redirects to '/'", async () => {
    const response = (await callLoader()) as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
  });

  it("clears both session cookies for the environment with hardened attributes", async () => {
    const response = (await callLoader()) as Response;
    const cookies = response.headers.getSetCookie();

    expect(cookies).toHaveLength(2);
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining("user_session_env-123="),
        expect.stringContaining("user_session_hash_env-123="),
      ]),
    );
    for (const cookie of cookies) {
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("Secure");
      expect(cookie).toContain("SameSite=Strict");
    }
  });

  it("throws when the public key is not configured", async () => {
    delete process.env.PK_AUTHDOG;
    await expect(callLoader()).rejects.toThrow("Public key is not defined");
  });

  it("throws when the public key points at an untrusted host", async () => {
    process.env.PK_AUTHDOG = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    await expect(callLoader()).rejects.toThrow("Untrusted identity host");
  });
});
