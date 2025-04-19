import { cookies } from "next/headers";
import {buildSessionKey, getPublicKeyPayload} from "@authdog/node-commons";

export const getSessionCookie = async (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }
  const publicKeyObj = getPublicKeyPayload(publicKey);
  const cookieStore = await cookies();
  return cookieStore.get(buildSessionKey(publicKeyObj?.environmentId));
};
