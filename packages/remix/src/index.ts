import { json } from "@remix-run/node";

import { parseCookies } from "@authdog/node-commons";

// Helper function to validate and parse the public key
export const validateAndParsePublicKey = (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }

  // Decode Base64-encoded publicKey
  return JSON.parse(
    Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
  );
};

// Function to fetch user data from the identity host
export const fetchUserData = async (
  identityHost: string,
  environmentId: string,
  token: string,
) => {
  const userData = await fetch(
    `${identityHost}/oidc/${environmentId}/userinfo`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!userData.ok) {
    throw new Error("Failed to fetch user info");
  }

  return userData.json();
};

// Function to create authentication response with cookies
export const createAuthResponse = (
  authenticatedUser: any,
  token: string,
  environmentId: string,
  request: Request,
) => {
  // Create response with cookies
  const response = json({
    user: authenticatedUser.user,
    isAuthenticated: true,
  });

  // Set cookies in the response headers
  const headers = new Headers(response.headers);

  // Serialize the user object separately
  const userSessionValue = JSON.stringify(authenticatedUser?.user);
  const userSessionHashValue = token;

  headers.append(
    "Set-Cookie",
    `user_session_${environmentId}=${encodeURIComponent(userSessionValue)}; Path=/; HttpOnly; Secure; SameSite=Strict`,
  );
  headers.append(
    "Set-Cookie",
    `user_session_hash_${environmentId}=${encodeURIComponent(userSessionHashValue)}; Path=/; HttpOnly; Secure; SameSite=Strict`,
  );

  // Remove token from URL
  const newUrl = new URL(request.url);
  newUrl.searchParams.delete("token");
  headers.append("Location", newUrl.toString());

  // Add cache control headers
  headers.append(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  headers.append("Pragma", "no-cache");
  headers.append("Expires", "0");
  headers.append("Vary", "Cookie");
  headers.append("Content-Type", "application/json");
  headers.append("Access-Control-Allow-Origin", "*");
  headers.append("Access-Control-Allow-Credentials", "true");

  return json(
    {
      user: authenticatedUser.user,
      isAuthenticated: true,
    },
    {
      headers,
    },
  );
};

// Function to authenticate with cookies
export const authenticateWithCookies = async (
  request: Request,
  publicKeyObj: any,
) => {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get("Cookie");
    const cookies = parseCookies(cookieHeader);

    if (cookies.length === 0) {
      return json({
        user: null,
        isAuthenticated: false,
      });
    }

    // Find our specific cookies
    const userSessionHashCookie = cookies.find(
      (c) => c.name === `user_session_hash_${publicKeyObj?.environmentId}`,
    );

    if (userSessionHashCookie) {
      const userSessionHashValue = userSessionHashCookie.value;
      const authenticatedUser = await fetchUserData(
        publicKeyObj?.identityHost,
        publicKeyObj?.environmentId,
        userSessionHashValue,
      );

      return json({
        user: authenticatedUser.user,
        isAuthenticated: true,
      });
    }
  } catch (error) {
    console.error("Error authenticating with cookies:", error);
  }

  return null;
};

// Main loader function
export const remixAuthLoader = async ({
  request,
  context,
}: {
  request: Request;
  context: Record<string, any>;
}) => {
  const publicKey = process.env.PK_AUTHDOG as string;
  const publicKeyObj = validateAndParsePublicKey(publicKey);

  // First check if we have a token in the URL
  const tokenFromUri = new URL(request.url).searchParams.get("token");

  if (tokenFromUri) {
    // Handle token from URL
    const authenticatedUser = await fetchUserData(
      publicKeyObj?.identityHost,
      publicKeyObj?.environmentId,
      tokenFromUri,
    );

    if (authenticatedUser?.meta && authenticatedUser?.meta?.code === 200) {
      // Store in context for later use
      const userSessionValue = JSON.stringify(authenticatedUser?.user);
      context[`user_session_${publicKeyObj?.environmentId}`] = userSessionValue;
      context[`user_session_hash_${publicKeyObj?.environmentId}`] =
        tokenFromUri;

      return createAuthResponse(
        authenticatedUser,
        tokenFromUri,
        publicKeyObj?.environmentId,
        request,
      );
    }
  } else {
    // Try to authenticate using cookies
    const cookieAuthResult = await authenticateWithCookies(
      request,
      publicKeyObj,
    );
    if (cookieAuthResult) {
      return cookieAuthResult;
    }
  }

  return json({
    loading: true,
  });
};
