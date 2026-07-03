import { describe, it, expect } from "vitest";
import { getSessionToken, DEFAULT_SESSION_COOKIE } from "./cookies";
import type { GatsbyFunctionRequest } from "./types";

const req = (
  headers: Record<string, string | string[] | undefined>,
  cookies?: Record<string, string>,
): GatsbyFunctionRequest => ({ headers, cookies });

describe("getSessionToken", () => {
  it("returns null when there is no cookie or bearer token", () => {
    expect(getSessionToken(req({}))).toBeNull();
  });

  it("prefers a bearer token from the Authorization header", () => {
    expect(
      getSessionToken(
        req(
          { authorization: "Bearer header-token" },
          { [DEFAULT_SESSION_COOKIE]: "cookie-token" },
        ),
      ),
    ).toBe("header-token");
  });

  it("reads Gatsby's pre-parsed cookies", () => {
    expect(
      getSessionToken(req({}, { [DEFAULT_SESSION_COOKIE]: "abc123" })),
    ).toBe("abc123");
  });

  it("falls back to parsing the raw Cookie header", () => {
    expect(
      getSessionToken(
        req({ cookie: `other=1; ${DEFAULT_SESSION_COOKIE}=abc123; another=2` }),
      ),
    ).toBe("abc123");
  });

  it("reads a custom cookie name", () => {
    expect(
      getSessionToken(req({ cookie: "my-token=xyz" }, {}), "my-token"),
    ).toBe("xyz");
  });

  it("preserves '=' inside the value (e.g. base64/JWT)", () => {
    const jwt = "header.payload.signature==";
    expect(
      getSessionToken(req({ cookie: `${DEFAULT_SESSION_COOKIE}=${jwt}` })),
    ).toBe(jwt);
  });

  it("ignores an empty bearer token and falls back to the cookie", () => {
    expect(
      getSessionToken(
        req(
          { authorization: "Bearer   " },
          { [DEFAULT_SESSION_COOKIE]: "abc" },
        ),
      ),
    ).toBe("abc");
  });
});
