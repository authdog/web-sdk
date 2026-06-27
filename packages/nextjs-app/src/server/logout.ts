import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getServerSidePayloadPublicKey } from "./publicKey";

export const logoutHandler = async (req: NextRequest) => {
  const cookiesStore = await cookies();

  const publicKey = process.env.PK_AUTHDOG as string;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const payload = await getServerSidePayloadPublicKey(publicKey);

  const environmentId = payload.environmentId;

  const deleteOptions = {
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  const cookieNameSession = `user_session_${environmentId}`;
  cookiesStore.set({ name: cookieNameSession, ...deleteOptions });

  const cookieNameHash = `user_session_hash_${environmentId}`;
  cookiesStore.set({ name: cookieNameHash, ...deleteOptions });

  return new Response(
    JSON.stringify({
      message: "Logout successfully",
      success: true,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
