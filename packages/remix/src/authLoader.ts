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
  console.log("[Authdog] Creating auth response with:", {
    hasUser: !!authenticatedUser?.user,
    environmentId,
    tokenLength: token?.length,
  });

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

  console.log("[Authdog] Setting cookies for environment:", environmentId);

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

  const publicKey = process.env.PK_AUTHDOG as string;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const publicKeyObj = validateAndParsePublicKey(publicKey);

  return json(
    {
      user: authenticatedUser.user,
      isAuthenticated: true,
      signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
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
    console.log(
      "[Authdog] Attempting cookie authentication for environment:",
      publicKeyObj?.environmentId,
    );

    // Get cookies from request
    const cookieHeader = request.headers.get("Cookie");
    const cookies = parseCookies(cookieHeader);

    if (cookies.length === 0) {
      console.log("[Authdog] No cookies found, returning unauthenticated");
      return json({
        user: null,
        isAuthenticated: false,
        signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
      });
    }

    // Find our specific cookies
    const userSessionHashCookie = cookies.find(
      (c: any) => c.name === `user_session_hash_${publicKeyObj?.environmentId}`,
    );

    if (userSessionHashCookie) {
      console.log(
        "[Authdog] Found session hash cookie, attempting to fetch user data",
      );
      const userSessionHashValue = userSessionHashCookie.value;
      const authenticatedUser = await fetchUserData(
        publicKeyObj?.identityHost,
        publicKeyObj?.environmentId,
        userSessionHashValue,
      );

      console.log("[Authdog] User data fetch result:", {
        success: !!authenticatedUser,
        hasUser: !!authenticatedUser?.user,
        metaCode: authenticatedUser?.meta?.code,
      });

      return json({
        user: authenticatedUser.user,
        isAuthenticated: true,
        signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
      });
    } else {
      console.log(
        "[Authdog] No session hash cookie found for environment:",
        publicKeyObj?.environmentId,
      );
    }
  } catch (error) {
    console.error("[Authdog] Error authenticating with cookies:", error);
  }

  return null;
};

interface IRemixAuthLoader {
  request: Request;
  context: Record<string, any>;
  params: {
    publicKey?: string;
  };
}

// Main loader function
export const remixAuthLoader = async ({
  request,
  context,
  params,
}: IRemixAuthLoader) => {
  console.log("[Authdog] Starting authentication loader");

  const publicKey = params?.publicKey as string;

  if (!publicKey) {
    throw Error("[Authdog][Remix] Missing public key");
  }

  const publicKeyObj = validateAndParsePublicKey(publicKey);

  console.log("[Authdog] Public key parsed:", {
    hasPublicKey: !!publicKey,
    environmentId: publicKeyObj?.environmentId,
  });

  // First check if we have a token in the URL
  const url = new URL(request.url);
  const tokenFromUri = url.searchParams.get("token");

  console.log("[Authdog] URL token check:", {
    hasToken: !!tokenFromUri,
    tokenLength: tokenFromUri?.length,
  });

  // If we have a token in URL, process it first
  if (tokenFromUri) {
    console.log("[Authdog] Processing token from URL");
    const authenticatedUser = await fetchUserData(
      publicKeyObj?.identityHost,
      publicKeyObj?.environmentId,
      tokenFromUri,
    );

    console.log("[Authdog] Token authentication result:", {
      success: !!authenticatedUser,
      hasUser: !!authenticatedUser?.user,
      metaCode: authenticatedUser?.meta?.code,
    });

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

      return json(
        {
          user: authenticatedUser.user,
          isAuthenticated: true,
          signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
        },
        {
          headers: authResponse.headers,
        },
      );
    }
  }

  // If no token in URL or token authentication failed, try cookie authentication
  console.log("[Authdog] Attempting cookie authentication");
  const cookieAuthResult = await authenticateWithCookies(request, publicKeyObj);
  if (cookieAuthResult) {
    console.log("[Authdog] Cookie authentication successful");
    return cookieAuthResult;
  }

  console.log(
    "[Authdog] No authentication methods succeeded, returning unauthenticated",
  );
  // If we get here, we're not authenticated
  return json({
    user: null,
    isAuthenticated: false,
    signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
  });
};
