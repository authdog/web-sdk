import { describe, it, expect } from "vitest";
import type { Context } from "koa";
import { getSessionToken, SESSION_COOKIE_NAME } from "./cookies";

const makeCtx = (headers: Record<string, string | undefined>): Context => {
  const lower: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    lower[key.toLowerCase()] = value;
  }
  return {
    headers: lower,
    // Koa's ctx.get returns "" for a missing header.
    get: (name: string) => lower[name.toLowerCase()] ?? "",
  } as unknown as Context;
};

describe("getSessionToken", () => {
  it("returns the bearer token from the Authorization header", () => {
    const ctx = makeCtx({ authorization: "Bearer abc.def.ghi" });
    expect(getSessionToken(ctx)).toBe("abc.def.ghi");
  });

  it("matches the Bearer scheme case-insensitively and trims the token", () => {
    const ctx = makeCtx({ authorization: "bearer   spaced-token  " });
    expect(getSessionToken(ctx)).toBe("spaced-token");
  });

  it("prefers the bearer header over the session cookie", () => {
    const ctx = makeCtx({
      authorization: "Bearer from-header",
      cookie: `${SESSION_COOKIE_NAME}=from-cookie`,
    });
    expect(getSessionToken(ctx)).toBe("from-header");
  });

  it("falls back to the session cookie when no bearer token is present", () => {
    const ctx = makeCtx({ cookie: `${SESSION_COOKIE_NAME}=cookie-token` });
    expect(getSessionToken(ctx)).toBe("cookie-token");
  });

  it("falls back to the cookie when the bearer token is empty", () => {
    const ctx = makeCtx({
      authorization: "Bearer   ",
      cookie: `${SESSION_COOKIE_NAME}=cookie-token`,
    });
    expect(getSessionToken(ctx)).toBe("cookie-token");
  });

  it("preserves tokens that contain '=' (base64 / JWT padding)", () => {
    const jwt = "header.payload.signature==";
    const ctx = makeCtx({ cookie: `${SESSION_COOKIE_NAME}=${jwt}` });
    expect(getSessionToken(ctx)).toBe(jwt);
  });

  it("picks the session cookie out of a multi-cookie header", () => {
    const ctx = makeCtx({
      cookie: `theme=dark; ${SESSION_COOKIE_NAME}=mine; other=x`,
    });
    expect(getSessionToken(ctx)).toBe("mine");
  });

  it("returns null when there is no header and no cookie", () => {
    expect(getSessionToken(makeCtx({}))).toBeNull();
  });

  it("returns null when the cookie header lacks the session cookie", () => {
    const ctx = makeCtx({ cookie: "theme=dark; other=x" });
    expect(getSessionToken(ctx)).toBeNull();
  });

  it("ignores a non-bearer Authorization header and falls back to cookie", () => {
    const ctx = makeCtx({
      authorization: "Basic dXNlcjpwYXNz",
      cookie: `${SESSION_COOKIE_NAME}=cookie-token`,
    });
    expect(getSessionToken(ctx)).toBe("cookie-token");
  });
});
