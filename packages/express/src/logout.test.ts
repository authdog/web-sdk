import { afterEach, describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { logoutHandler } from "./logout";
import { SESSION_COOKIE_NAME } from "./cookies";

interface FakeRes {
  headers: Record<string, string>;
  setHeader: (name: string, value: string) => void;
  redirect: (status: number, url: string) => void;
  redirectedTo: { status: number; url: string } | null;
}

const makeRes = (): FakeRes => {
  const res: FakeRes = {
    headers: {},
    redirectedTo: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    redirect(status, url) {
      this.redirectedTo = { status, url };
    },
  };
  return res;
};

const makeReq = (query: Record<string, unknown>): Request =>
  ({ headers: {}, query }) as unknown as Request;

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe("logoutHandler", () => {
  it("expires the session cookie via Set-Cookie", () => {
    const res = makeRes();
    logoutHandler(makeReq({}), res as unknown as Response);

    const cookie = res.headers["Set-Cookie"];
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=;`);
    expect(cookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
  });

  it("omits the Secure attribute outside production", () => {
    process.env.NODE_ENV = "development";
    const res = makeRes();
    logoutHandler(makeReq({}), res as unknown as Response);
    expect(res.headers["Set-Cookie"]).not.toContain("Secure");
  });

  it("adds the Secure attribute in production", () => {
    process.env.NODE_ENV = "production";
    const res = makeRes();
    logoutHandler(makeReq({}), res as unknown as Response);
    expect(res.headers["Set-Cookie"]).toContain("Secure");
  });

  it("redirects (302) to a sanitized same-origin redirect_uri", () => {
    const res = makeRes();
    logoutHandler(makeReq({ redirect_uri: "/dashboard" }), res as unknown as Response);
    expect(res.redirectedTo).toEqual({ status: 302, url: "/dashboard" });
  });

  it("falls back to '/' when redirect_uri is absent", () => {
    const res = makeRes();
    logoutHandler(makeReq({}), res as unknown as Response);
    expect(res.redirectedTo).toEqual({ status: 302, url: "/" });
  });

  it("falls back to '/' for an open-redirect attempt", () => {
    const res = makeRes();
    logoutHandler(
      makeReq({ redirect_uri: "https://evil.com" }),
      res as unknown as Response,
    );
    expect(res.redirectedTo).toEqual({ status: 302, url: "/" });
  });
});
