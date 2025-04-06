import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Loader function
export const loader: LoaderFunction = async ({ request, context }) => {
  // const user = await authenticator.getUser(request, context); // Uncomment if needed
  console.log("request", request);
  // console.log("context", context);

  const publicKey = process.env.PK_AUTHDOG as string;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }

  // Decode Base64-encoded publicKey
  const publicKeyObj = JSON.parse(
    Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
  );

  const tokenFromUri = new URL(request.url).searchParams.get("token");

  if (tokenFromUri) {
    const userData = await fetch(
      `${publicKeyObj?.identityHost}/oidc/${publicKeyObj?.environmentId}/userinfo`,
      {
        headers: {
          authorization: `Bearer ${tokenFromUri}`,
        },
      },
    );

    console.log("userData", userData);

    // if (!userData.ok) {
    //     throw new Error("Failed to fetch user info");
    // }

    const authenticatedUser = await userData.json();

    console.log("authenticatedUser", authenticatedUser);

    // if (authenticatedUser?.meta && authenticatedUser?.meta?.code === 200) {
    //     // response.cookies.set({
    //     //     name: `user_session_${publicKeyObj?.environmentId}`,
    //     //     value: JSON.stringify(authenticatedUser?.user),
    //     //     ...options,
    //     // });

    //     // response.cookies.set({
    //     //     name: `user_session_hash_${publicKeyObj?.environmentId}`,
    //     //     value: tokenFromUri,
    //     //     ...options,
    //     // });

    //     context[`user_session_${publicKeyObj?.environmentId}`] = JSON.stringify(authenticatedUser?.user);
    // }
    return json({ authenticatedUser });
  }

  // get token_dev from cookies
  const cookies = request.headers.get("Cookie");
  const tokenDev = cookies
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("token_dev="));

  if (tokenDev) {
    const token = tokenDev.split("=")[1];
    const userData = await fetch(
      `${publicKeyObj?.identityHost}/oidc/${publicKeyObj?.environmentId}/userinfo`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("userData", userData);

    const authenticatedUser = await userData.json();

    console.log("authenticatedUser", authenticatedUser);

    return json({ authenticatedUser });
  }

  return null;
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen items-center justify-center">
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
