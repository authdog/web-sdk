import { describe, it, expect, beforeEach, vi } from "vitest";
import fastify from "fastify";
import { authdogPlugin } from "./plugin";

// Mock only the network/identity surface of node-commons; the pure helpers
// (parseCookies, validateAndParsePublicKey, sanitizeRedirectPath) keep their
// real implementations so we exercise genuine token extraction and key parsing.
const fetchUserData = vi.fn();
const isAuthenticatedUserInfo = vi.fn();

vi.mock("@authdog/node-commons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@authdog/node-commons")>();
  return {
    ...actual,
    fetchUserData: (...args: unknown[]) => fetchUserData(...args),
    isAuthenticatedUserInfo: (...args: unknown[]) =>
      isAuthenticatedUserInfo(...args),
  };
});

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

const VALID_PK = encodePublicKey({
  environmentId: "env-123",
  identityHost: "https://identity.authdog.com",
});

const buildApp = async (
  opts: { publicKey?: string; fetchUserInfo?: boolean } = {},
) => {
  const app = fastify();
  await app.register(authdogPlugin, { publicKey: VALID_PK, ...opts });

  app.get("/me", { preHandler: app.authdog.requireAuth }, async (req) => ({
    user: req.authdog?.user ?? null,
  }));
  app.get("/ctx", async (req) => req.authdog);
  app.get("/pk", async () => app.authdog.getPublicKey());
  app.get("/logout", async (req, reply) => app.authdog.logout(req, reply));

  await app.ready();
  return app;
};

beforeEach(() => {
  fetchUserData.mockReset();
  isAuthenticatedUserInfo.mockReset();
});

describe("authdogPlugin registration", () => {
  it("validates the public key once at registration and exposes the payload", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/pk" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com",
    });
    await app.close();
  });

  it("fails fast on an invalid public key", async () => {
    const app = fastify();
    await expect(
      app.register(authdogPlugin, { publicKey: "nope" }),
    ).rejects.toThrow("Invalid public key");
    await app.close();
  });

  it("rejects a public key pointing at an untrusted identity host", async () => {
    const app = fastify();
    const evilPk = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    await expect(
      app.register(authdogPlugin, { publicKey: evilPk }),
    ).rejects.toThrow("Untrusted identity host");
    await app.close();
  });
});

describe("request context / token extraction", () => {
  it("decorates request with an unauthenticated context when no token is present", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/ctx" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    expect(fetchUserData).not.toHaveBeenCalled();
    await app.close();
  });

  it("extracts the token from the authdog-session cookie", async () => {
    fetchUserData.mockResolvedValue({ meta: { code: 200 }, user: { id: "u1" } });
    isAuthenticatedUserInfo.mockReturnValue(true);

    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { cookie: "authdog-session=jwt.token.value" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      token: "jwt.token.value",
      user: { id: "u1" },
      isAuthenticated: true,
    });
    expect(fetchUserData).toHaveBeenCalledWith(
      "https://identity.authdog.com",
      "env-123",
      "jwt.token.value",
    );
    await app.close();
  });

  it("does not truncate JWT-style cookie values containing '='", async () => {
    fetchUserData.mockResolvedValue({});
    isAuthenticatedUserInfo.mockReturnValue(false);

    const app = await buildApp();
    const jwt = "header.payload.signature==";
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { cookie: `authdog-session=${jwt}` },
    });
    expect(JSON.parse(res.body).token).toBe(jwt);
    await app.close();
  });

  it("falls back to the Bearer authorization header", async () => {
    fetchUserData.mockResolvedValue({});
    isAuthenticatedUserInfo.mockReturnValue(false);

    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { authorization: "Bearer bearer-token" },
    });
    expect(JSON.parse(res.body).token).toBe("bearer-token");
    expect(fetchUserData).toHaveBeenCalledWith(
      "https://identity.authdog.com",
      "env-123",
      "bearer-token",
    );
    await app.close();
  });

  it("prefers the cookie over the Bearer header", async () => {
    fetchUserData.mockResolvedValue({});
    isAuthenticatedUserInfo.mockReturnValue(false);

    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: {
        cookie: "authdog-session=cookie-token",
        authorization: "Bearer bearer-token",
      },
    });
    expect(JSON.parse(res.body).token).toBe("cookie-token");
    await app.close();
  });

  it("ignores a non-Bearer authorization header", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { authorization: "Basic abc123" },
    });
    expect(JSON.parse(res.body).token).toBeNull();
    expect(fetchUserData).not.toHaveBeenCalled();
    await app.close();
  });

  it("stays unauthenticated when the identity host rejects the token", async () => {
    fetchUserData.mockResolvedValue({ meta: { code: 401 } });
    isAuthenticatedUserInfo.mockReturnValue(false);

    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { cookie: "authdog-session=bad-token" },
    });
    const body = JSON.parse(res.body);
    expect(body.token).toBe("bad-token");
    expect(body.isAuthenticated).toBe(false);
    await app.close();
  });

  it("never throws from the hook when fetchUserData rejects", async () => {
    fetchUserData.mockRejectedValue(new Error("network down"));

    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { cookie: "authdog-session=some-token" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).isAuthenticated).toBe(false);
    await app.close();
  });

  it("does not call the identity host when fetchUserInfo is false", async () => {
    const app = await buildApp({ fetchUserInfo: false });
    const res = await app.inject({
      method: "GET",
      url: "/ctx",
      headers: { cookie: "authdog-session=some-token" },
    });
    const body = JSON.parse(res.body);
    expect(body.token).toBe("some-token");
    expect(body.isAuthenticated).toBe(false);
    expect(fetchUserData).not.toHaveBeenCalled();
    await app.close();
  });
});

describe("requireAuth preHandler", () => {
  it("rejects an unauthenticated request with 401", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/me" });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ error: "Unauthorized" });
    await app.close();
  });

  it("allows an authenticated request through", async () => {
    fetchUserData.mockResolvedValue({ meta: { code: 200 }, user: { id: "u1" } });
    isAuthenticatedUserInfo.mockReturnValue(true);

    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/me",
      headers: { cookie: "authdog-session=good-token" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ user: { id: "u1" } });
    await app.close();
  });
});

describe("logout", () => {
  it("clears the session cookie and redirects to '/' by default", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/logout" });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/");
    const setCookie = res.headers["set-cookie"] as string;
    expect(setCookie).toContain("authdog-session=;");
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    await app.close();
  });

  it("redirects to a sanitized same-origin redirect_uri", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/logout?redirect_uri=%2Fdashboard",
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/dashboard");
    await app.close();
  });

  it("refuses an open-redirect to an external origin", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/logout?redirect_uri=https%3A%2F%2Fevil.com",
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/");
    await app.close();
  });
});
