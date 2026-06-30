import { describe, it, expect } from "vitest";
import type { Request } from "express";
import { getSessionToken, SESSION_COOKIE_NAME } from "./cookies";

const makeReq = (headers: Record<string, string | undefined>): Request =>
  ({ headers }) as unknown as Request;

describe("getSessionToken", () => {
  it("returns the bearer token from the Authorization header", () => {
    const req = makeReq({ authorization: "Bearer abc.def.ghi" });
    expect(getSessionToken(req)).toBe("abc.def.ghi");
  });

  it("matches the Bearer scheme case-insensitively and trims the token", () => {
    const req = makeReq({ authorization: "bearer   spaced-token  " });
    expect(getSessionToken(req)).toBe("spaced-token");
  });

  it("prefers the bearer header over the session cookie", () => {
    const req = makeReq({
      authorization: "Bearer from-header",
      cookie: `${SESSION_COOKIE_NAME}=from-cookie`,
    });
    expect(getSessionToken(req)).toBe("from-header");
  });

  it("falls back to the session cookie when no bearer token is present", () => {
    const req = makeReq({ cookie: `${SESSION_COOKIE_NAME}=cookie-token` });
    expect(getSessionToken(req)).toBe("cookie-token");
  });

  it("falls back to the cookie when the bearer token is empty", () => {
    const req = makeReq({
      authorization: "Bearer   ",
      cookie: `${SESSION_COOKIE_NAME}=cookie-token`,
    });
    expect(getSessionToken(req)).toBe("cookie-token");
  });

  it("preserves tokens that contain '=' (base64 / JWT padding)", () => {
    const jwt = "header.payload.signature==";
    const req = makeReq({ cookie: `${SESSION_COOKIE_NAME}=${jwt}` });
    expect(getSessionToken(req)).toBe(jwt);
  });

  it("picks the session cookie out of a multi-cookie header", () => {
    const req = makeReq({
      cookie: `theme=dark; ${SESSION_COOKIE_NAME}=mine; other=x`,
    });
    expect(getSessionToken(req)).toBe("mine");
  });

  it("returns null when there is no header and no cookie", () => {
    expect(getSessionToken(makeReq({}))).toBeNull();
  });

  it("returns null when the cookie header lacks the session cookie", () => {
    const req = makeReq({ cookie: "theme=dark; other=x" });
    expect(getSessionToken(req)).toBeNull();
  });

  it("ignores a non-bearer Authorization header and falls back to cookie", () => {
    const req = makeReq({
      authorization: "Basic dXNlcjpwYXNz",
      cookie: `${SESSION_COOKIE_NAME}=cookie-token`,
    });
    expect(getSessionToken(req)).toBe("cookie-token");
  });
});
