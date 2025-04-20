import { cookies } from "next/headers";
import { getPublicKeyPayload } from "../commons";

export const getSessionCookie = async (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }
  const publicKeyObj = getPublicKeyPayload(publicKey);
  const cookieStore = await cookies();
  return cookieStore.get(`user_session_${publicKeyObj?.environmentId}`);
};
