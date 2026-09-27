import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  SESSION_COOKIE_NAME,
  getServerSession,
  logoutResponse,
} from "./index";

describe("getServerSession", () => {
  it("reads the session token from an H3-style node event", () => {
    const event = {
      node: { req: { headers: { cookie: `${SESSION_COOKIE_NAME}=tok-abc; x=1` } } },
    };
    expect(getServerSession(event)).toBe("tok-abc");
  });

  it("reads the session token from a Web Request headers object", () => {
    const event = { headers: new Headers({ cookie: `${SESSION_COOKIE_NAME}=web-tok` }) };
    expect(getServerSession(event)).toBe("web-tok");
  });

  it("returns null when the session cookie is absent", () => {
    expect(getServerSession({ node: { req: { headers: { cookie: "x=1" } } } })).toBeNull();
  });

  it("returns null when there is no cookie header", () => {
    expect(getServerSession({})).toBeNull();
  });

  it("preserves values containing '='", () => {
    const jwt = "a.b.c==";
    const event = { headers: { cookie: `${SESSION_COOKIE_NAME}=${jwt}` } };
    expect(getServerSession(event)).toBe(jwt);
  });
});

describe("logoutResponse", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("redirects to '/' and expires the session cookie", () => {
    const response = logoutResponse(new Request("https://app.test/logout"));
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=;`);
    expect(cookie).toContain("Expires=Thu, 01 Jan 1970");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("sanitizes an open-redirect target down to '/'", () => {
    const response = logoutResponse(
      new Request("https://app.test/logout?redirect_uri=https://evil.com"),
    );
    expect(response.headers.get("location")).toBe("/");
  });

  it("honours a safe relative redirect target", () => {
    const response = logoutResponse(
      new Request("https://app.test/logout?redirect_uri=/dashboard"),
    );
    expect(response.headers.get("location")).toBe("/dashboard");
  });
});
