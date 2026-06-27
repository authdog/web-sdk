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

/** JWT shape: three base64url segments separated by dots. */
export const JWT_PATTERN =
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Extracts the `?token=` query parameter from a redirect/deep-link URL.
 * Returns `null` when the URL is malformed or carries no token.
 */
export const getTokenFromUri = (url: string): string | null => {
  try {
    return new URL(url).searchParams.get("token");
  } catch {
    return null;
  }
};
