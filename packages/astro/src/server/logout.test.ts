import { describe, it, expect, afterEach } from "vitest";
import { logoutHandler } from "./logout";
import { DEFAULT_SESSION_COOKIE } from "./cookies";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe("logoutHandler", () => {
  it("responds with a 302 redirect", async () => {
    const response = await logoutHandler(
      new Request("https://app.example.com/logout"),
    );
    expect(response.status).toBe(302);
  });

  it("clears the default session cookie with an expiry in the past", async () => {
    const response = await logoutHandler(
      new Request("https://app.example.com/logout"),
    );
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(setCookie).toContain(`${DEFAULT_SESSION_COOKIE}=;`);
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });

  it("clears a custom cookie name", async () => {
    const response = await logoutHandler(
      new Request("https://app.example.com/logout"),
      "my-token",
    );
    expect(response.headers.get("set-cookie")).toContain("my-token=;");
  });

  it("omits Secure outside production", async () => {
    process.env.NODE_ENV = "development";
    const response = await logoutHandler(
      new Request("https://app.example.com/logout"),
    );
    expect(response.headers.get("set-cookie")).not.toContain("Secure");
  });

  it("includes Secure in production", async () => {
    process.env.NODE_ENV = "production";
    const response = await logoutHandler(
      new Request("https://app.example.com/logout"),
    );
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });

  it("redirects to '/' when no redirect_uri is given", async () => {
    const response = await logoutHandler(
      new Request("https://app.example.com/logout"),
    );
    expect(response.headers.get("location")).toBe("/");
  });

  it("redirects to a safe same-origin path", async () => {
    const response = await logoutHandler(
      new Request("https://app.example.com/logout?redirect_uri=/dashboard"),
    );
    expect(response.headers.get("location")).toBe("/dashboard");
  });

  it("falls back to '/' for an open-redirect attempt", async () => {
    const response = await logoutHandler(
      new Request(
        "https://app.example.com/logout?redirect_uri=https://evil.com",
      ),
    );
    expect(response.headers.get("location")).toBe("/");
  });

  it("falls back to '/' for a protocol-relative redirect", async () => {
    const response = await logoutHandler(
      new Request(
        "https://app.example.com/logout?redirect_uri=%2F%2Fevil.com",
      ),
    );
    expect(response.headers.get("location")).toBe("/");
  });
});
