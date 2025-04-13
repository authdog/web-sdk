import { json, type LoaderFunction, type MetaFunction, createCookie } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";

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
  // console.log("request", request);
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

  // First check if we have a token in the URL
  const tokenFromUri = new URL(request.url).searchParams.get("token");

  if (tokenFromUri) {


    // Handle token from URL
    const userData = await fetch(
      `${publicKeyObj?.identityHost}/oidc/${publicKeyObj?.environmentId}/userinfo`,
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

    // console.log("authenticatedUser", authenticatedUser);

    if (authenticatedUser?.meta && authenticatedUser?.meta?.code === 200) {
      // Create response with cookies
      const response = json({
        user: authenticatedUser.user,
        isAuthenticated: true
      });
      
      // Set cookies in the response headers
      const headers = new Headers(response.headers);
      
      // Serialize the user object separately
      const userSessionValue = JSON.stringify(authenticatedUser?.user);
      const userSessionHashValue = tokenFromUri;

      // Create cookie instances
      // const userSessionCookie = createCookie(`user_session_${publicKeyObj?.environmentId}`, {
      //   path: "/",
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "strict",
      // });

      // const userSessionHashCookie = createCookie(`user_session_hash_${publicKeyObj?.environmentId}`, {
      //   path: "/",
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "strict",
      // });

      
      headers.append(
        "Set-Cookie", 
        `user_session_${publicKeyObj?.environmentId}=${encodeURIComponent(userSessionValue)}; Path=/; HttpOnly; Secure; SameSite=Strict`
        // await userSessionCookie.serialize(userSessionValue)
      );
      headers.append(
        "Set-Cookie", 
        `user_session_hash_${publicKeyObj?.environmentId}=${encodeURIComponent(userSessionHashValue)}; Path=/; HttpOnly; Secure; SameSite=Strict`
        // await userSessionHashCookie.serialize(userSessionHashValue)
      );

      // newUrl = url without token

      // newUrl.searchParams.delete("token");

      headers.append(
        "Location",
        // same uri without token
        new URL(request.url).toString()
          .replace(/([?&])token=[^&]*/, "$1")
          .replace(/([?&])$/, "")
          .replace(/([?&])$/, "")
          // new URL(request.url).toString()
          // .replace(/([?&])token=[^&]*/, "$1")
      )
      
      // Store in context for later use
      context[`user_session_${publicKeyObj?.environmentId}`] = userSessionValue;
      context[`user_session_hash_${publicKeyObj?.environmentId}`] = userSessionHashValue;

      // remove token from URL
      // const url = new URL(request.url);
      // url.searchParams.delete("token");
      // const newUrl = url.toString();
      // headers.append("Location", newUrl);
      // headers.append("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      // headers.append("Pragma", "no-cache");
      // headers.append("Expires", "0");
      // headers.append("Vary", "Cookie");
      // headers.append("Content-Type", "application/json");
      // headers.append("Access-Control-Allow-Origin", "*");
      // headers.append("Access-Control-Allow-Credentials", "true");
      // headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization");
      // headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      // headers.append("Access-Control-Max-Age", "86400");


      // redirect to new URL without token
      const newUrl  = new URL(request.url);
      newUrl.searchParams.delete("token");
      headers.append("Location", newUrl.toString());
      
      headers.append("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      headers.append("Pragma", "no-cache");
      headers.append("Expires", "0");
      headers.append("Vary", "Cookie");
      headers.append("Content-Type", "application/json");
      headers.append("Access-Control-Allow-Origin", "*");
      headers.append("Access-Control-Allow-Credentials", "true");

      return json({
        user: authenticatedUser.user,
        isAuthenticated: true
      }, {
        headers
      });
      
      // return json({
      //   user: authenticatedUser.user,
      //   isAuthenticated: true
      // }, {
      //   headers
      // });
    }

    

    // return json({
    //   user: null,
    //   isAuthenticated: false
    // });
  } else {
    // Try to authenticate using cookies
    try {
      // Get cookies from request
      const cookieHeader = request.headers.get("Cookie");

      // console.log(cookieHeader);

      if (!cookieHeader) {
        return json({
          user: null,
          isAuthenticated: false
        });
      }

      // Parse cookies
      const cookies = cookieHeader.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return { name, value };
      });

      // console.log("cookies", cookies);

      // Find our specific cookies
      // const userSessionCookie = cookies.find(c => c.name === `user_session_${publicKeyObj?.environmentId}`);
      const userSessionHashCookie = cookies.find(c => c.name === `user_session_hash_${publicKeyObj?.environmentId}`);

      if (userSessionHashCookie) {
        // console.log("has cookies");

        // Decode the URL-encoded cookie values
        const userSessionHashValue = userSessionHashCookie.value;

        // console.log("userSessionValue", userSessionValue);
        // console.log("userSessionHashValue", userSessionHashValue);

        const userData = await fetch(
          `${publicKeyObj?.identityHost}/oidc/${publicKeyObj?.environmentId}/userinfo`,
          {
            headers: {
              authorization: `Bearer ${userSessionHashValue}`,
            },
          },
        );
        if (!userData.ok) {
          throw new Error("Failed to fetch user info");
        }
        const authenticatedUser = await userData.json();


        return json({
          user: authenticatedUser.user,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error("Error authenticating with cookies:", error);
    }
  }

  return json({
    loading: true,
  });
};

const Index = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen items-center justify-center">
      {JSON.stringify(data)}
    </div>
  );
};

export default Index;
