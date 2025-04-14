export interface PublicKeyPayload {
  environmentId: string;
  identityHost: string;
  version?: string;
  region?: string;
}
export const getPublicKeyPayload = (publicKey: string): PublicKeyPayload => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }
  try {
    return JSON.parse(
      Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
    );
  } catch (e) {
    throw new Error("Failed to parse public key");
  }
};
