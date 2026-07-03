import { describe, it, expect, afterEach } from "vitest";
import { logoutHandler } from "./logout";
import { DEFAULT_SESSION_COOKIE } from "./cookies";
import type { LambdaEvent } from "./types";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

const event = (
  queryStringParameters?: LambdaEvent["queryStringParameters"],
): LambdaEvent => ({ headers: {}, queryStringParameters });

describe("logoutHandler", () => {
  it("responds with a 302 redirect", () => {
    expect(logoutHandler(event()).statusCode).toBe(302);
  });

  it("clears the default session cookie with an expiry in the past", () => {
    const setCookie = String(logoutHandler(event()).headers?.["Set-Cookie"]);
    expect(setCookie).toContain(`${DEFAULT_SESSION_COOKIE}=;`);
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });

  it("clears a custom cookie name", () => {
    const setCookie = String(
      logoutHandler(event(), undefined, "my-token").headers?.["Set-Cookie"],
    );
    expect(setCookie).toContain("my-token=;");
  });

  it("omits Secure outside production", () => {
    process.env.NODE_ENV = "development";
    expect(
      String(logoutHandler(event()).headers?.["Set-Cookie"]),
    ).not.toContain("Secure");
  });

  it("includes Secure in production", () => {
    process.env.NODE_ENV = "production";
    expect(String(logoutHandler(event()).headers?.["Set-Cookie"])).toContain(
      "Secure",
    );
  });

  it("redirects to '/' when no redirect_uri is given", () => {
    expect(logoutHandler(event()).headers?.Location).toBe("/");
  });

  it("redirects to a safe same-origin path", () => {
    expect(
      logoutHandler(event({ redirect_uri: "/dashboard" })).headers?.Location,
    ).toBe("/dashboard");
  });

  it("falls back to '/' for an open-redirect attempt", () => {
    expect(
      logoutHandler(event({ redirect_uri: "https://evil.com" })).headers
        ?.Location,
    ).toBe("/");
  });
});
