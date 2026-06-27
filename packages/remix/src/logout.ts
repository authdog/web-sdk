import { LoaderFunction, redirect } from "@remix-run/node";
import { validateAndParsePublicKey } from "@authdog/node-commons";

export const logoutLoader: LoaderFunction = async ({ context, request }) => {
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

  return redirect("/", { headers });
};
