export interface PublicKeyPayload {
  environmentId: string;
  identityHost: string;
  version?: string;
  region?: "EU" | "US" | "APAC";
}

/**
 * Hosts the SDK is allowed to send the bearer token to. The identity host is
 * decoded from the (potentially attacker-influenced) public key, so it MUST be
 * validated against an allowlist before it is ever used as a `fetch` target —
 * otherwise a crafted `pk_` could point the SDK (and the token) at an internal
 * address (SSRF) or an attacker-controlled server (token exfiltration + auth
 * bypass).
 *
 * Additional hosts can be allowed via the `AUTHDOG_ALLOWED_IDENTITY_HOSTS`
 * environment variable (comma-separated hostnames), e.g. for self-hosted
 * identity servers.
 */
const DEFAULT_ALLOWED_HOST_SUFFIXES = ["authdog.com", "authdog.xyz"];

const isPrivateOrLoopbackHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  // IPv4 literals in private / loopback / link-local ranges
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // link-local (cloud metadata)
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  // IPv6 loopback / unique-local
  if (h === "::1" || h === "[::1]") return true;
  if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("[fc") || h.startsWith("[fd"))
    return true;
  return false;
};

const getAllowedHostSuffixes = (): string[] => {
  const extra = (process.env.AUTHDOG_ALLOWED_IDENTITY_HOSTS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_HOST_SUFFIXES, ...extra];
};

/**
 * Validates that an identity host is safe to send credentials to: it must be a
 * well-formed `https:` URL whose hostname matches the allowlist and is not a
 * private/loopback address. Throws otherwise.
 */
export const assertTrustedIdentityHost = (identityHost: string): string => {
  let url: URL;
  try {
    url = new URL(identityHost);
  } catch {
    throw new Error("Invalid identity host");
  }

  if (url.protocol !== "https:") {
    throw new Error("Identity host must use https");
  }

  const hostname = url.hostname.toLowerCase();

  if (isPrivateOrLoopbackHost(hostname)) {
    throw new Error("Untrusted identity host");
  }

  const allowed = getAllowedHostSuffixes().some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );

  if (!allowed) {
    throw new Error("Untrusted identity host");
  }

  // Normalize: strip any trailing slash so callers can safely template URLs.
  return identityHost.replace(/\/+$/, "");
};

/**
 * Decodes and fully validates an Authdog public key (`pk_…`). This is the single
 * source of truth for parsing public keys — every framework SDK should use it
 * rather than re-implementing base64/JSON decoding.
 */
export const validateAndParsePublicKey = (publicKey: string): PublicKeyPayload => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(
      Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
    );
  } catch {
    throw new Error("Failed to parse public key");
  }

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid public key payload");
  }

  const { environmentId, identityHost } = payload as Record<string, unknown>;

  if (typeof environmentId !== "string" || environmentId.length === 0) {
    throw new Error("Invalid public key: missing environmentId");
  }

  if (typeof identityHost !== "string" || identityHost.length === 0) {
    throw new Error("Invalid public key: missing identityHost");
  }

  // Reject any public key pointing at an untrusted identity host.
  const safeIdentityHost = assertTrustedIdentityHost(identityHost);

  return { ...(payload as PublicKeyPayload), identityHost: safeIdentityHost };
};

/**
 * @deprecated Use {@link validateAndParsePublicKey}, which additionally
 * validates the decoded payload and identity host. Kept as an alias for
 * backwards compatibility.
 */
export const getPublicKeyPayload = validateAndParsePublicKey;
