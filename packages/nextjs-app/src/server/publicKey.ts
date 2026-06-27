import { validateAndParsePublicKey } from "../commons";
export const getServerSidePayloadPublicKey = (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }
  return validateAndParsePublicKey(publicKey);
};
