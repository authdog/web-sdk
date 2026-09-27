import {
  assertTrustedIdentityHost,
  type PublicKeyPayload,
} from "@authdog/node-commons";

const decodeBase64Json = (b64: string): unknown => {
  const binary =
    typeof Buffer !== "undefined"
      ? Buffer.from(b64, "base64").toString("utf-8")
      : typeof atob !== "undefined"
        ? decodeURIComponent(
            Array.from(atob(b64), (c) =>
              `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`,
            ).join(""),
          )
        : (() => {
            throw new Error("No base64 decoder available");
          })();
  return JSON.parse(binary);
};

/** Browser-safe public key parse with identity-host allowlist. */
export const parsePublicKey = (publicKey: string): PublicKeyPayload => {
  if (!publicKey) throw new Error("Public key is not defined");
  if (!publicKey.startsWith("pk_")) throw new Error("Invalid public key");

  let payload: unknown;
  try {
    payload = decodeBase64Json(publicKey.replace("pk_", ""));
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

  const safeIdentityHost = assertTrustedIdentityHost(identityHost);
  return {
    ...(payload as PublicKeyPayload),
    identityHost: safeIdentityHost,
  };
};
