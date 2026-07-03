import { describe, it, expect, afterEach, vi } from "vitest";
import { logoutHandler } from "./logout";
import { DEFAULT_SESSION_COOKIE } from "./cookies";
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "./types";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  vi.restoreAllMocks();
});

const mockRes = () => {
  const headers: Record<string, string | string[]> = {};
  const res = {
    setHeader: vi.fn((name: string, value: string | string[]) => {
      headers[name] = value;
    }),
    status: vi.fn(() => res),
    json: vi.fn(),
    send: vi.fn(),
    redirect: vi.fn(),
  } as unknown as GatsbyFunctionResponse & {
    setHeader: ReturnType<typeof vi.fn>;
    redirect: ReturnType<typeof vi.fn>;
  };
  return { res, headers };
};

const req = (
  query?: GatsbyFunctionRequest["query"],
): GatsbyFunctionRequest => ({
  headers: {},
  query,
});

describe("logoutHandler", () => {
  it("clears the default session cookie with an expiry in the past", () => {
    const { res, headers } = mockRes();
    logoutHandler(req(), res);

    const setCookie = String(headers["Set-Cookie"]);
    expect(setCookie).toContain(`${DEFAULT_SESSION_COOKIE}=;`);
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });

  it("clears a custom cookie name", () => {
    const { res, headers } = mockRes();
    logoutHandler(req(), res, "my-token");
    expect(String(headers["Set-Cookie"])).toContain("my-token=;");
  });

  it("omits Secure outside production", () => {
    process.env.NODE_ENV = "development";
    const { res, headers } = mockRes();
    logoutHandler(req(), res);
    expect(String(headers["Set-Cookie"])).not.toContain("Secure");
  });

  it("includes Secure in production", () => {
    process.env.NODE_ENV = "production";
    const { res, headers } = mockRes();
    logoutHandler(req(), res);
    expect(String(headers["Set-Cookie"])).toContain("Secure");
  });

  it("redirects to '/' when no redirect_uri is given", () => {
    const { res } = mockRes();
    logoutHandler(req(), res);
    expect(res.redirect).toHaveBeenCalledWith(302, "/");
  });

  it("redirects to a safe same-origin path", () => {
    const { res } = mockRes();
    logoutHandler(req({ redirect_uri: "/dashboard" }), res);
    expect(res.redirect).toHaveBeenCalledWith(302, "/dashboard");
  });

  it("falls back to '/' for an open-redirect attempt", () => {
    const { res } = mockRes();
    logoutHandler(req({ redirect_uri: "https://evil.com" }), res);
    expect(res.redirect).toHaveBeenCalledWith(302, "/");
  });
});
