import { describe, it, expect } from "vitest";
import { getSessionCookie } from "./cookies";

const requestWithCookie = (cookie: string | null): Request =>
  new Request("https://app.test/", {
    headers: cookie ? { cookie } : {},
  });

describe("getSessionCookie", () => {
  it("returns null when there is no cookie header", async () => {
    expect(await getSessionCookie(requestWithCookie(null))).toBeNull();
  });

  it("extracts the authdog-session cookie value", async () => {
    const req = requestWithCookie("authdog-session=token-abc; other=1");
    expect(await getSessionCookie(req)).toBe("token-abc");
  });

  it("returns null when the session cookie is absent", async () => {
    const req = requestWithCookie("other=1; another=2");
    expect(await getSessionCookie(req)).toBeNull();
  });

  it("correctly handles session values that contain '='", async () => {
    const jwt = "a.b.c==";
    const req = requestWithCookie(`authdog-session=${jwt}`);
    expect(await getSessionCookie(req)).toBe(jwt);
  });
});
