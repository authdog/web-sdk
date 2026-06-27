import { type LoaderFunction, redirect } from "react-router";
import { remixAuthLoader } from "./authLoader";

export const identityLoader = (): LoaderFunction => {
  return async ({ context, request }) => {
    return await remixAuthLoader({
      request,
      context,
      params: {
        publicKey: process.env.PK_AUTHDOG,
      },
    });
  };
};

export const identityDevAction = async ({
  redirectTo = "/",
}: {
  redirectTo: string;
}) => {
  const publicKey = process.env.PK_AUTHDOG as string;
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const payload = JSON.parse(
    Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
  );

  const environmentId = payload.environmentId;
  const cookieNameSession = `user_session_${environmentId}`;
  const cookieNameHash = `user_session_hash_${environmentId}`;

  const response = redirect(redirectTo);

  response.headers.append(
    "Set-Cookie",
    `${cookieNameSession}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
  );
  response.headers.append(
    "Set-Cookie",
    `${cookieNameHash}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
  );

  return response;
};
