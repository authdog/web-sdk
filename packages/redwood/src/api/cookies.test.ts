import { describe, it, expect } from "vitest";
import { getSessionToken, DEFAULT_SESSION_COOKIE } from "./cookies";
import type { LambdaEvent } from "./types";

const event = (headers: Record<string, string | undefined>): LambdaEvent => ({
  headers,
});

describe("getSessionToken", () => {
  it("returns null when there is no cookie or bearer token", () => {
    expect(getSessionToken(event({}))).toBeNull();
  });

  it("prefers a bearer token from the Authorization header", () => {
    expect(
      getSessionToken(
        event({
          authorization: "Bearer header-token",
          cookie: `${DEFAULT_SESSION_COOKIE}=cookie-token`,
        }),
      ),
    ).toBe("header-token");
  });

  it("reads the session cookie", () => {
    expect(
      getSessionToken(
        event({ cookie: `other=1; ${DEFAULT_SESSION_COOKIE}=abc123; z=2` }),
      ),
    ).toBe("abc123");
  });

  it("looks headers up case-insensitively", () => {
    expect(
      getSessionToken(event({ Cookie: `${DEFAULT_SESSION_COOKIE}=abc123` })),
    ).toBe("abc123");
    expect(getSessionToken(event({ Authorization: "Bearer tok" }))).toBe("tok");
  });

  it("reads a custom cookie name", () => {
    expect(getSessionToken(event({ cookie: "my-token=xyz" }), "my-token")).toBe(
      "xyz",
    );
  });

  it("preserves '=' inside the value (e.g. base64/JWT)", () => {
    const jwt = "header.payload.signature==";
    expect(
      getSessionToken(event({ cookie: `${DEFAULT_SESSION_COOKIE}=${jwt}` })),
    ).toBe(jwt);
  });
});
