import { validateAndParsePublicKey } from "@authdog/node-commons";

import { redirectResponse } from "./http";

export const logoutLoader = async ({
  context,
  request,
}: {
  context?: Record<string, any>;
  request?: Request;
} = {}) => {
  const headers = new Headers();

  const publicKey = process.env.PK_AUTHDOG;
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const publicKeyObj = validateAndParsePublicKey(publicKey);

  const environmentId = publicKeyObj.environmentId;

  headers.append(
    "Set-Cookie",
    `user_session_${environmentId}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
  );
  headers.append(
    "Set-Cookie",
    `user_session_hash_${environmentId}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
  );

  return redirectResponse("/", { headers });
};
