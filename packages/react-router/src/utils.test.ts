import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { identityDevAction } from "./utils";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const TRUSTED_KEY = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});

describe("identityDevAction", () => {
  const originalPk = process.env.PK_AUTHDOG;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.PK_AUTHDOG = TRUSTED_KEY;
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    if (originalPk === undefined) delete process.env.PK_AUTHDOG;
    else process.env.PK_AUTHDOG = originalPk;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("is disabled in production", async () => {
    process.env.NODE_ENV = "production";
    await expect(identityDevAction({ redirectTo: "/" })).rejects.toThrow(
      "not available in production",
    );
  });

  it("throws when the public key is not configured", async () => {
    delete process.env.PK_AUTHDOG;
    await expect(identityDevAction({ redirectTo: "/" })).rejects.toThrow(
      "Public key is not defined",
    );
  });

  it("redirects to the requested path and clears session cookies", async () => {
    const response = await identityDevAction({ redirectTo: "/dashboard" });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/dashboard");

    const cookies = response.headers.getSetCookie();
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

  it("sanitizes an open-redirect target down to '/'", async () => {
    const response = await identityDevAction({
      redirectTo: "https://evil.com",
    });
    expect(response.headers.get("location")).toBe("/");
  });
});
