import { cookies } from "next/headers";
import { getServerSidePayloadPublicKey } from "@authdog/nextjs-app/dist/index.server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const cookiesStore = await cookies();

  const publicKey = process.env.PK_AUTHDOG as string;

  console.log(publicKey);
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const payload = await getServerSidePayloadPublicKey(publicKey);

  const environmentId = payload.environmentId;
  const cookieNameSession = `user_session_${environmentId}`;

  const cookieValueSession = cookiesStore.get(cookieNameSession);

  if (cookieValueSession) {
    cookiesStore.delete(cookieNameSession);
  }

  const cookieNameHash = `user_session_hash_${environmentId}`;
  const cookieValueHash = cookiesStore.get(cookieNameHash);

  if (cookieValueHash) {
    cookiesStore.delete(cookieNameHash);
  }

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
}
