import { getPublicKeyPayload, PublicKeyPayload } from "@authdog/node-commons";

export { useAuthMiddleware } from "./middleware";
export { getSessionCookie } from "./cookies";

export const getServerSidePayloadPublicKey = (publicKey: string): PublicKeyPayload => {
        if (!publicKey) {
          throw new Error("Public key is not defined");
        }
        return getPublicKeyPayload(publicKey);
};