import { cookies } from "next/headers";

export default function Home() {
  const cookieStore = cookies();

  const publicKey = process.env.PK_AUTHDOG as string;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }

  let publicKeyObj;
  try {
    // Decode Base64-encoded publicKey
    publicKeyObj = JSON.parse(
      Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8")
    );
  } catch (error) {
    throw new Error("Failed to parse public key");
  }


  // Get the session cookie
  const sessionCookie = cookieStore.get(`user_session_${publicKeyObj?.environmentId}`);

  return (

    <div className="flex h-screen items-center justify-center">
        <code>{JSON.stringify(sessionCookie, null, 2)}</code>
    </div>
  );
}
