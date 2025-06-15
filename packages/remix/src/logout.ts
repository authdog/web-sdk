import { LoaderFunction, redirect } from "@remix-run/node";

export const logoutLoader: LoaderFunction = async ({ context, request }) => {
  const headers = new Headers();
  
  const publicKey = process.env.PK_AUTHDOG;
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const payload = JSON.parse(
    Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8")
  );

  const environmentId = payload.environmentId;

  headers.append("Set-Cookie", `user_session_${environmentId}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
  headers.append("Set-Cookie", `user_session_hash_${environmentId}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);

  return redirect("/", { headers });
};