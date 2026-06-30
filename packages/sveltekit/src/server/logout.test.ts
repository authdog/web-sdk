import { describe, it, expect } from "vitest";
import { logoutHandler } from "./logout";
import { DEFAULT_SESSION_COOKIE } from "./cookies";

const logoutRequest = (url: string): Request => new Request(url);

describe("logoutHandler", () => {
  it("responds with a 302 redirect", async () => {
    const res = await logoutHandler(logoutRequest("https://app.example.com/logout"));
    expect(res.status).toBe(302);
  });

  it("clears the default session cookie with an expired Set-Cookie", async () => {
    const res = await logoutHandler(logoutRequest("https://app.example.com/logout"));
    const setCookie = res.headers.get("Set-Cookie") ?? "";

    expect(setCookie).toContain(`${DEFAULT_SESSION_COOKIE}=;`);
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
  });

  it("clears a custom cookie name", async () => {
    const res = await logoutHandler(
      logoutRequest("https://app.example.com/logout"),
      "my-session",
    );
    expect(res.headers.get("Set-Cookie") ?? "").toContain("my-session=;");
  });

  it("defaults the redirect to '/' when no redirect_uri is given", async () => {
    const res = await logoutHandler(logoutRequest("https://app.example.com/logout"));
    expect(res.headers.get("Location")).toBe("/");
  });

  it("honors a safe same-origin relative redirect_uri", async () => {
    const res = await logoutHandler(
      logoutRequest("https://app.example.com/logout?redirect_uri=%2Fgoodbye"),
    );
    expect(res.headers.get("Location")).toBe("/goodbye");
  });

  it("rejects an absolute off-site redirect (open-redirect protection)", async () => {
    const res = await logoutHandler(
      logoutRequest(
        "https://app.example.com/logout?redirect_uri=https%3A%2F%2Fevil.com",
      ),
    );
    expect(res.headers.get("Location")).toBe("/");
  });

  it("rejects a protocol-relative redirect", async () => {
    const res = await logoutHandler(
      logoutRequest("https://app.example.com/logout?redirect_uri=%2F%2Fevil.com"),
    );
    expect(res.headers.get("Location")).toBe("/");
  });
});
