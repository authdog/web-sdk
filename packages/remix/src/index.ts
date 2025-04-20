import { json } from "@remix-run/node";

import {
  parseCookies,
  validateAndParsePublicKey,
  fetchUserData,
} from "@authdog/node-commons";

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
      (c: any) => c.name === `user_session_hash_${publicKeyObj?.environmentId}`,
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
  params,
}: {
  request: Request;
  context: Record<string, any>;
  params: any;
}) => {
  const publicKey =
    typeof process !== "undefined"
      ? (process.env.PK_AUTHDOG as string)
      : params?.publicKey;
  const publicKeyObj = validateAndParsePublicKey(publicKey);

  // First check if we have a token in the URL
  const url = new URL(request.url);
  const tokenFromUri = url.searchParams.get("token");

  // Try to authenticate using cookies first
  const cookieAuthResult = await authenticateWithCookies(request, publicKeyObj);

  if (cookieAuthResult) {
    // If we have a token in URL, still process it but don't show loading
    if (tokenFromUri) {
      const authenticatedUser = await fetchUserData(
        publicKeyObj?.identityHost,
        publicKeyObj?.environmentId,
        tokenFromUri,
      );

      if (authenticatedUser?.meta && authenticatedUser?.meta?.code === 200) {
        // Store in context for later use
        const userSessionValue = JSON.stringify(authenticatedUser?.user);
        context[`user_session_${publicKeyObj?.environmentId}`] =
          userSessionValue;
        context[`user_session_hash_${publicKeyObj?.environmentId}`] =
          tokenFromUri;

        // Create the response with auth data
        const authResponse = createAuthResponse(
          authenticatedUser,
          tokenFromUri,
          publicKeyObj?.environmentId,
          request,
        );

        // Return the response with cookies but don't redirect
        // The client-side reload will handle the URL cleanup
        return json(
          {
            user: authenticatedUser.user,
            isAuthenticated: true,
          },
          {
            headers: authResponse.headers,
          },
        );
      }
    }
    return cookieAuthResult;
  }

  // If we have a token but no cookie auth, show loading while processing token
  if (tokenFromUri) {
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

      // Create the response with auth data
      const authResponse = createAuthResponse(
        authenticatedUser,
        tokenFromUri,
        publicKeyObj?.environmentId,
        request,
      );

      // Return the response with cookies but don't redirect
      // The client-side reload will handle the URL cleanup
      return json(
        {
          user: authenticatedUser.user,
          isAuthenticated: true,
        },
        {
          headers: authResponse.headers,
        },
      );
    }
    return json({ loading: true });
  }

  // If we get here, we're not authenticated and not loading
  return json({
    user: null,
    isAuthenticated: false,
  });
};

export { AuthdogProvider } from "./provider.tsx";
