import { describe, it, expect } from "vitest";
import { getServerSidePayloadPublicKey } from "./publicKey";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

describe("getServerSidePayloadPublicKey", () => {
  it("returns the validated payload serialized as JSON", () => {
    const key = encodePublicKey({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com",
    });

    expect(JSON.parse(getServerSidePayloadPublicKey(key))).toEqual({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com",
    });
  });

  it("throws when the public key is empty", () => {
    expect(() => getServerSidePayloadPublicKey("")).toThrow(
      "Public key is not defined",
    );
  });

  it("throws when the public key lacks the pk_ prefix", () => {
    expect(() => getServerSidePayloadPublicKey("sk_abc")).toThrow(
      "Invalid public key",
    );
  });

  it("wraps parse failures in a 'Failed to parse public key' error", () => {
    // Correct prefix but the body is not valid base64 JSON.
    expect(() => getServerSidePayloadPublicKey("pk_not-base64-json!!")).toThrow(
      "Failed to parse public key",
    );
  });

  it("wraps untrusted-host failures in a 'Failed to parse public key' error", () => {
    const key = encodePublicKey({
      environmentId: "env-1",
      identityHost: "https://evil.com",
    });
    expect(() => getServerSidePayloadPublicKey(key)).toThrow(
      "Failed to parse public key",
    );
  });
});
