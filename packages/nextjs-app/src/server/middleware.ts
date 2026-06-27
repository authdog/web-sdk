import { NextResponse, type NextRequest } from "next/server";
import {
  validateAndParsePublicKey,
  fetchUserData,
  isAuthenticatedUserInfo,
} from "@authdog/node-commons";

export const useAuthMiddleware = (publicKey: string) => {
  const publicKeyObj = validateAndParsePublicKey(publicKey);

  return async (request: NextRequest) => {
    const response = NextResponse.next();
    const options = {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    const tokenFromUri = new URL(request.nextUrl).searchParams.get("token");

    if (tokenFromUri) {
      const userData = await fetchUserData(
        publicKeyObj.identityHost,
        publicKeyObj.environmentId,
        tokenFromUri,
      );

      if (isAuthenticatedUserInfo(userData)) {
        response.cookies.set({
          name: `user_session_${publicKeyObj.environmentId}`,
          value: JSON.stringify(userData.user),
          ...options,
        });

        response.cookies.set({
          name: `user_session_hash_${publicKeyObj.environmentId}`,
          value: tokenFromUri,
          ...options,
        });
      }
    }
    // TODO: token from cookies

    return response;
  };
};
