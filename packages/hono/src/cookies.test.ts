import { describe, it, expect } from "vitest";
import type { Context } from "hono";
import { getSessionToken, SESSION_COOKIE_NAME } from "./cookies";

const makeCtx = (headers: Record<string, string | undefined>): Context =>
  ({
    req: {
      header: (name: string) => headers[name.toLowerCase()],
    },
  }) as unknown as Context;

describe("getSessionToken", () => {
  it("returns the bearer token from the Authorization header", () => {
    const c = makeCtx({ authorization: "Bearer abc.def.ghi" });
    expect(getSessionToken(c)).toBe("abc.def.ghi");
  });

  it("matches the Bearer scheme case-insensitively and trims the token", () => {
    const c = makeCtx({ authorization: "bearer   spaced-token  " });
    expect(getSessionToken(c)).toBe("spaced-token");
  });

  it("prefers the bearer header over the session cookie", () => {
    const c = makeCtx({
      authorization: "Bearer from-header",
      cookie: `${SESSION_COOKIE_NAME}=from-cookie`,
    });
    expect(getSessionToken(c)).toBe("from-header");
  });

  it("falls back to the session cookie when no bearer token is present", () => {
    const c = makeCtx({ cookie: `${SESSION_COOKIE_NAME}=cookie-token` });
    expect(getSessionToken(c)).toBe("cookie-token");
  });

  it("falls back to the cookie when the bearer token is empty", () => {
    const c = makeCtx({
      authorization: "Bearer   ",
      cookie: `${SESSION_COOKIE_NAME}=cookie-token`,
    });
    expect(getSessionToken(c)).toBe("cookie-token");
  });

  it("preserves tokens that contain '=' (base64 / JWT padding)", () => {
    const jwt = "header.payload.signature==";
    const c = makeCtx({ cookie: `${SESSION_COOKIE_NAME}=${jwt}` });
    expect(getSessionToken(c)).toBe(jwt);
  });

  it("picks the session cookie out of a multi-cookie header", () => {
    const c = makeCtx({
      cookie: `theme=dark; ${SESSION_COOKIE_NAME}=mine; other=x`,
    });
    expect(getSessionToken(c)).toBe("mine");
  });

  it("returns null when there is no header and no cookie", () => {
    expect(getSessionToken(makeCtx({}))).toBeNull();
  });

  it("returns null when the cookie header lacks the session cookie", () => {
    const c = makeCtx({ cookie: "theme=dark; other=x" });
    expect(getSessionToken(c)).toBeNull();
  });

  it("ignores a non-bearer Authorization header and falls back to cookie", () => {
    const c = makeCtx({
      authorization: "Basic dXNlcjpwYXNz",
      cookie: `${SESSION_COOKIE_NAME}=cookie-token`,
    });
    expect(getSessionToken(c)).toBe("cookie-token");
  });
});
