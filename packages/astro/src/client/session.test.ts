import { describe, it, expect } from "vitest";
import { getTokenFromUri, validatePublicKey } from "./session";

describe("getTokenFromUri", () => {
  it("extracts the token query parameter", () => {
    expect(
      getTokenFromUri("https://app.example.com/callback?token=abc123"),
    ).toBe("abc123");
  });

  it("returns null when no token is present", () => {
    expect(getTokenFromUri("https://app.example.com/callback")).toBeNull();
  });

  it("URL-decodes the token value", () => {
    expect(
      getTokenFromUri("https://app.example.com/?token=a%2Bb%3Dc"),
    ).toBe("a+b=c");
  });

  it("ignores other query parameters", () => {
    expect(
      getTokenFromUri("https://app.example.com/?foo=bar&token=t&baz=qux"),
    ).toBe("t");
  });
});

describe("validatePublicKey", () => {
  it("accepts a key with the pk_ prefix", () => {
    expect(() => validatePublicKey("pk_anything")).not.toThrow();
  });

  it("throws when the key is empty", () => {
    expect(() => validatePublicKey("")).toThrow("Public key is not defined");
  });

  it("throws when the key lacks the pk_ prefix", () => {
    expect(() => validatePublicKey("nope")).toThrow("Invalid public key");
  });
});
