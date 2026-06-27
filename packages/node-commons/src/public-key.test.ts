import { describe, it, expect, afterEach } from "vitest";
import {
  assertTrustedIdentityHost,
  validateAndParsePublicKey,
  getPublicKeyPayload,
} from "./public-key";

const encodePublicKey = (payload: unknown): string =>
  `pk_${Buffer.from(JSON.stringify(payload)).toString("base64")}`;

describe("assertTrustedIdentityHost", () => {
  afterEach(() => {
    delete process.env.AUTHDOG_ALLOWED_IDENTITY_HOSTS;
  });

  it("accepts the default allowed hosts", () => {
    expect(assertTrustedIdentityHost("https://authdog.com")).toBe(
      "https://authdog.com",
    );
    expect(assertTrustedIdentityHost("https://identity.authdog.com")).toBe(
      "https://identity.authdog.com",
    );
    expect(assertTrustedIdentityHost("https://foo.authdog.xyz")).toBe(
      "https://foo.authdog.xyz",
    );
  });

  it("strips trailing slashes from the returned host", () => {
    expect(assertTrustedIdentityHost("https://identity.authdog.com/")).toBe(
      "https://identity.authdog.com",
    );
    expect(assertTrustedIdentityHost("https://identity.authdog.com///")).toBe(
      "https://identity.authdog.com",
    );
  });

  it("throws on malformed URLs", () => {
    expect(() => assertTrustedIdentityHost("not a url")).toThrow(
      "Invalid identity host",
    );
    expect(() => assertTrustedIdentityHost("")).toThrow("Invalid identity host");
  });

  it("requires https", () => {
    expect(() => assertTrustedIdentityHost("http://authdog.com")).toThrow(
      "Identity host must use https",
    );
  });

  it("rejects hosts that merely contain an allowed suffix as a substring", () => {
    // suffix matching must be on a dot-boundary, not substring
    expect(() => assertTrustedIdentityHost("https://authdog.com.evil.com")).toThrow(
      "Untrusted identity host",
    );
    expect(() => assertTrustedIdentityHost("https://notauthdog.com")).toThrow(
      "Untrusted identity host",
    );
  });

  it("rejects loopback and private hosts (SSRF protection)", () => {
    for (const host of [
      "https://localhost",
      "https://app.localhost",
      "https://127.0.0.1",
      "https://10.0.0.5",
      "https://192.168.1.1",
      "https://169.254.169.254", // cloud metadata
      "https://172.16.0.1",
      "https://[::1]",
    ]) {
      expect(() => assertTrustedIdentityHost(host)).toThrow();
    }
  });

  it("allows extra hosts via AUTHDOG_ALLOWED_IDENTITY_HOSTS", () => {
    process.env.AUTHDOG_ALLOWED_IDENTITY_HOSTS = "id.example.com, other.test";
    expect(assertTrustedIdentityHost("https://id.example.com")).toBe(
      "https://id.example.com",
    );
    expect(assertTrustedIdentityHost("https://sub.other.test")).toBe(
      "https://sub.other.test",
    );
  });

  it("does not allow arbitrary hosts when the env var is empty", () => {
    process.env.AUTHDOG_ALLOWED_IDENTITY_HOSTS = "";
    expect(() => assertTrustedIdentityHost("https://example.com")).toThrow(
      "Untrusted identity host",
    );
  });
});

describe("validateAndParsePublicKey", () => {
  it("decodes and validates a well-formed public key", () => {
    const key = encodePublicKey({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com/",
      region: "EU",
    });

    expect(validateAndParsePublicKey(key)).toEqual({
      environmentId: "env-123",
      identityHost: "https://identity.authdog.com", // trailing slash stripped
      region: "EU",
    });
  });

  it("throws when the key is empty", () => {
    expect(() => validateAndParsePublicKey("")).toThrow(
      "Public key is not defined",
    );
  });

  it("throws when the key lacks the pk_ prefix", () => {
    expect(() => validateAndParsePublicKey("sk_abc")).toThrow(
      "Invalid public key",
    );
  });

  it("throws when the payload is not valid base64 JSON", () => {
    expect(() => validateAndParsePublicKey("pk_not-base64-json!!")).toThrow(
      "Failed to parse public key",
    );
  });

  it("throws when the decoded payload is not an object", () => {
    expect(() => validateAndParsePublicKey(encodePublicKey("a string"))).toThrow(
      "Invalid public key payload",
    );
    expect(() => validateAndParsePublicKey(encodePublicKey(null))).toThrow(
      "Invalid public key payload",
    );
  });

  it("throws when environmentId is missing or empty", () => {
    expect(() =>
      validateAndParsePublicKey(
        encodePublicKey({ identityHost: "https://identity.authdog.com" }),
      ),
    ).toThrow("missing environmentId");
    expect(() =>
      validateAndParsePublicKey(
        encodePublicKey({
          environmentId: "",
          identityHost: "https://identity.authdog.com",
        }),
      ),
    ).toThrow("missing environmentId");
  });

  it("throws when identityHost is missing or empty", () => {
    expect(() =>
      validateAndParsePublicKey(encodePublicKey({ environmentId: "env-1" })),
    ).toThrow("missing identityHost");
  });

  it("rejects a public key pointing at an untrusted identity host", () => {
    expect(() =>
      validateAndParsePublicKey(
        encodePublicKey({
          environmentId: "env-1",
          identityHost: "https://evil.com",
        }),
      ),
    ).toThrow("Untrusted identity host");
  });

  it("rejects a public key pointing at a private host (SSRF)", () => {
    expect(() =>
      validateAndParsePublicKey(
        encodePublicKey({
          environmentId: "env-1",
          identityHost: "https://169.254.169.254",
        }),
      ),
    ).toThrow();
  });
});

describe("getPublicKeyPayload (deprecated alias)", () => {
  it("is the same function as validateAndParsePublicKey", () => {
    expect(getPublicKeyPayload).toBe(validateAndParsePublicKey);
  });
});
