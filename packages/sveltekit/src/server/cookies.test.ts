import { describe, it, expect } from "vitest";
import { getSessionCookie, DEFAULT_SESSION_COOKIE } from "./cookies";

const requestWithCookie = (cookieHeader: string | null): Request =>
  new Request("https://app.example.com/", {
    headers: cookieHeader === null ? {} : { cookie: cookieHeader },
  });

describe("getSessionCookie", () => {
  it("returns null when the request has no cookie header", async () => {
    expect(await getSessionCookie(requestWithCookie(null))).toBeNull();
  });

  it("reads the default session cookie", async () => {
    const req = requestWithCookie(`${DEFAULT_SESSION_COOKIE}=tok-123`);
    expect(await getSessionCookie(req)).toBe("tok-123");
  });

  it("reads a custom cookie name and ignores others", async () => {
    const req = requestWithCookie("other=foo; my-session=tok-xyz");
    expect(await getSessionCookie(req, "my-session")).toBe("tok-xyz");
  });

  it("returns null when the named cookie is absent", async () => {
    const req = requestWithCookie("other=foo");
    expect(await getSessionCookie(req)).toBeNull();
  });

  it("preserves values containing '=' (e.g. JWTs / base64 padding)", async () => {
    const jwt = "header.payload.signature==";
    const req = requestWithCookie(`${DEFAULT_SESSION_COOKIE}=${jwt}`);
    expect(await getSessionCookie(req)).toBe(jwt);
  });
});
