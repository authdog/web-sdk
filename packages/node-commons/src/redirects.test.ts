import { describe, it, expect } from "vitest";
import { sanitizeRedirectPath } from "./redirects";

describe("sanitizeRedirectPath", () => {
  it("allows simple same-origin absolute paths", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/a/b/c?x=1#frag")).toBe("/a/b/c?x=1#frag");
  });

  it("falls back to '/' by default for invalid input", () => {
    expect(sanitizeRedirectPath(undefined)).toBe("/");
    expect(sanitizeRedirectPath(null)).toBe("/");
    expect(sanitizeRedirectPath("")).toBe("/");
    expect(sanitizeRedirectPath(123)).toBe("/");
    expect(sanitizeRedirectPath({})).toBe("/");
  });

  it("honours a custom fallback", () => {
    expect(sanitizeRedirectPath("", "/login")).toBe("/login");
    expect(sanitizeRedirectPath("https://evil.com", "/home")).toBe("/home");
  });

  it("rejects non-absolute paths", () => {
    expect(sanitizeRedirectPath("dashboard")).toBe("/");
    expect(sanitizeRedirectPath("./relative")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeRedirectPath("//evil.com")).toBe("/");
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/");
  });

  it("rejects absolute URLs with a scheme", () => {
    expect(sanitizeRedirectPath("http://evil.com")).toBe("/");
    expect(sanitizeRedirectPath("https://evil.com/path")).toBe("/");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/");
    expect(sanitizeRedirectPath("data:text/html,abc")).toBe("/");
  });

  it("rejects paths containing backslashes", () => {
    expect(sanitizeRedirectPath("/foo\\bar")).toBe("/");
  });

  it("rejects paths containing control characters", () => {
    expect(sanitizeRedirectPath("/foo\tbar")).toBe("/");
    expect(sanitizeRedirectPath("/foo\nbar")).toBe("/");
    expect(sanitizeRedirectPath("/\x00evil")).toBe("/");
  });
});
