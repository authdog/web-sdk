import { describe, it, expect } from "vitest";
import { getTokenFromUri, validatePublicKey } from "./session";

describe("getTokenFromUri", () => {
  it("extracts the token query param", () => {
    expect(getTokenFromUri("https://app.example.com/cb?token=abc.def.ghi")).toBe(
      "abc.def.ghi",
    );
  });

  it("returns null when no token param is present", () => {
    expect(getTokenFromUri("https://app.example.com/cb?foo=bar")).toBeNull();
  });
});

describe("validatePublicKey", () => {
  it("accepts a pk_-prefixed key", () => {
    expect(() => validatePublicKey("pk_abc")).not.toThrow();
  });

  it("throws when the key is empty", () => {
    expect(() => validatePublicKey("")).toThrow("Public key is not defined");
  });

  it("throws when the key lacks the pk_ prefix", () => {
    expect(() => validatePublicKey("sk_abc")).toThrow("Invalid public key");
  });
});
