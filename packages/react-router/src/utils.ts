import {
  validateAndParsePublicKey,
  sanitizeRedirectPath,
} from "@authdog/node-commons";
import { reactRouterAuthLoader } from "./authLoader";
import { redirectResponse } from "./http";

export const identityLoader = () => {
  return async ({
    context = {},
    request,
  }: {
    context?: Record<string, any>;
    request: Request;
  }) => {
    return await reactRouterAuthLoader({
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

  const response = redirectResponse(sanitizeRedirectPath(redirectTo));

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
