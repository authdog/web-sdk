import { describe, it, expect } from "vitest";
import { getSessionCookie, DEFAULT_SESSION_COOKIE } from "./cookies";

const requestWithCookie = (cookieHeader: string | null): Request =>
  new Request("https://app.example.com/", {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });

describe("getSessionCookie", () => {
  it("returns null when there is no cookie header", async () => {
    await expect(getSessionCookie(requestWithCookie(null))).resolves.toBeNull();
  });

  it("returns the value of the default session cookie", async () => {
    const request = requestWithCookie(
      `other=1; ${DEFAULT_SESSION_COOKIE}=abc123; another=2`,
    );
    await expect(getSessionCookie(request)).resolves.toBe("abc123");
  });

  it("reads a custom cookie name", async () => {
    const request = requestWithCookie("my-token=xyz");
    await expect(getSessionCookie(request, "my-token")).resolves.toBe("xyz");
  });

  it("returns null when the named cookie is absent", async () => {
    const request = requestWithCookie("foo=bar");
    await expect(getSessionCookie(request)).resolves.toBeNull();
  });

  it("preserves '=' inside the value (e.g. base64/JWT)", async () => {
    const jwt = "header.payload.signature==";
    const request = requestWithCookie(`${DEFAULT_SESSION_COOKIE}=${jwt}`);
    await expect(getSessionCookie(request)).resolves.toBe(jwt);
  });
});
