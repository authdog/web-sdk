import { LoaderFunction, redirect } from "@remix-run/node";
import {
  validateAndParsePublicKey,
  sanitizeRedirectPath,
} from "@authdog/node-commons";
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
  if (process.env.NODE_ENV === "production") {
    throw new Error("identityDevAction is not available in production");
  }

  const publicKey = process.env.PK_AUTHDOG as string;
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const publicKeyObj = validateAndParsePublicKey(publicKey);

  const environmentId = publicKeyObj.environmentId;
  const cookieNameSession = `user_session_${environmentId}`;
  const cookieNameHash = `user_session_hash_${environmentId}`;

  const response = redirect(sanitizeRedirectPath(redirectTo));

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
