import { describe, it, expect } from "vitest";
import { getPublicKeyPayload } from "./commons";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

describe("getPublicKeyPayload", () => {
  it("decodes and validates a public key via the shared parser", () => {
    const key = encodePublicKey({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com/",
    });

    expect(getPublicKeyPayload(key)).toEqual({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com",
    });
  });

  it("rejects public keys pointing at untrusted identity hosts", () => {
    const key = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    expect(() => getPublicKeyPayload(key)).toThrow("Untrusted identity host");
  });

  it("throws on an invalid public key", () => {
    expect(() => getPublicKeyPayload("nope")).toThrow("Invalid public key");
  });
});
