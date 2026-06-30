import { describe, it, expect } from "vitest";
import { validatePublicKey } from "./session";

describe("validatePublicKey", () => {
  it("accepts a key with the pk_ prefix", () => {
    expect(() => validatePublicKey("pk_anything")).not.toThrow();
  });

  it("throws when the key is empty", () => {
    expect(() => validatePublicKey("")).toThrow("Public key is not defined");
  });

  it("throws when the key lacks the pk_ prefix", () => {
    expect(() => validatePublicKey("sk_secret")).toThrow("Invalid public key");
  });
});
