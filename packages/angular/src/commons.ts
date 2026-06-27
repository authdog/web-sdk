import {
  validateAndParsePublicKey,
  type PublicKeyPayload,
} from "@authdog/node-commons";

export type { PublicKeyPayload };

/**
 * Decodes and validates an Authdog public key. Delegates to the hardened
 * shared parser in @authdog/node-commons, which validates the payload and
 * enforces a trusted identity-host allowlist (SSRF / token-exfiltration
 * protection) rather than blindly decoding base64/JSON.
 */
export const getPublicKeyPayload = (publicKey: string): PublicKeyPayload => {
  return validateAndParsePublicKey(publicKey);
};

/** Lightweight, fast-fail shape check before the full decode. */
export const validatePublicKey = (publicKey: string): void => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }
};
