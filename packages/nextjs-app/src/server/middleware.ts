import { NextResponse, type NextRequest } from "next/server";

export const useAuthMiddleware = (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }

  const publicKeyObj = JSON.parse(
    Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
  );

  return async (request: NextRequest) => {
    const response = NextResponse.next();
    const options = {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      httpOnly: true,
    };

    const tokenFromUri = new URL(request.nextUrl).searchParams.get("token");

    if (tokenFromUri) {
      const userData = await fetch(
        `${publicKeyObj.identityHost}/oidc/${publicKeyObj.environmentId}/userinfo`,
        {
          headers: {
            authorization: `Bearer ${tokenFromUri}`,
          },
        },
      );

      if (!userData.ok) {
        throw new Error("Failed to fetch user info");
      }

      const authenticatedUser = await userData.json();

      if (authenticatedUser?.meta?.code === 200) {
        response.cookies.set({
          name: `user_session_${publicKeyObj.environmentId}`,
          value: JSON.stringify(authenticatedUser.user),
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
