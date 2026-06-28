import {
  parseCookies,
  validateAndParsePublicKey,
  fetchUserData,
  isAuthenticatedUserInfo,
} from "@authdog/node-commons";

import { jsonResponse } from "./http";

const isDev = process.env.NODE_ENV !== "production";

// Function to create authentication response with cookies
export const createAuthResponse = (
  authenticatedUser: any,
  token: string,
  environmentId: string,
  request: Request,
) => {
  if (isDev) {
    console.log("[Authdog] Creating auth response with:", {
      hasUser: !!authenticatedUser?.user,
      environmentId,
    });
  }

  // Set cookies in the response headers
  const headers = new Headers();

  // Serialize the user object separately
  const userSessionValue = JSON.stringify(authenticatedUser?.user);
  const userSessionHashValue = token;

  if (isDev) {
    console.log("[Authdog] Setting cookies for environment:", environmentId);
  }

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

  const publicKey = process.env.PK_AUTHDOG as string;

  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const publicKeyObj = validateAndParsePublicKey(publicKey);

  return jsonResponse(
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
    if (isDev) {
      console.log(
        "[Authdog] Attempting cookie authentication for environment:",
        publicKeyObj?.environmentId,
      );
    }

    // Get cookies from request (parseCookies URL-decodes values)
    const cookieHeader = request.headers.get("Cookie");
    const cookies = parseCookies(cookieHeader);

    const unauthenticated = jsonResponse({
      user: null,
      isAuthenticated: false,
      signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
    });

    if (cookies.length === 0) {
      if (isDev) {
        console.log("[Authdog] No cookies found, returning unauthenticated");
      }
      return unauthenticated;
    }

    // Find our specific cookies
    const userSessionHashCookie = cookies.find(
      (c: any) => c.name === `user_session_hash_${publicKeyObj?.environmentId}`,
    );

    if (userSessionHashCookie) {
      if (isDev) {
        console.log(
          "[Authdog] Found session hash cookie, attempting to fetch user data",
        );
      }
      const userSessionHashValue = userSessionHashCookie.value;
      const authenticatedUser = await fetchUserData(
        publicKeyObj?.identityHost,
        publicKeyObj?.environmentId,
        userSessionHashValue,
      );

      if (isDev) {
        console.log("[Authdog] User data fetch result:", {
          success: !!authenticatedUser,
          hasUser: !!authenticatedUser?.user,
          metaCode: authenticatedUser?.meta?.code,
        });
      }

      if (!isAuthenticatedUserInfo(authenticatedUser)) {
        return unauthenticated;
      }

      return jsonResponse({
        user: authenticatedUser.user,
        isAuthenticated: true,
        signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
      });
    } else if (isDev) {
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

interface ITanstackAuthLoader {
  request: Request;
  context: Record<string, any>;
  params: {
    publicKey?: string;
  };
}

// Main loader function
export const tanstackAuthLoader = async ({
  request,
  context,
  params,
}: ITanstackAuthLoader) => {
  if (isDev) {
    console.log("[Authdog] Starting authentication loader");
  }

  const publicKey = params?.publicKey as string;

  if (!publicKey) {
    throw Error("[Authdog][TanStack] Missing public key");
  }

  const publicKeyObj = validateAndParsePublicKey(publicKey);

  if (isDev) {
    console.log("[Authdog] Public key parsed:", {
      hasPublicKey: !!publicKey,
      environmentId: publicKeyObj?.environmentId,
    });
  }

  // First check if we have a token in the URL
  const url = new URL(request.url);
  const tokenFromUri = url.searchParams.get("token");

  if (isDev) {
    console.log("[Authdog] URL token check:", {
      hasToken: !!tokenFromUri,
    });
  }

  // If we have a token in URL, process it first
  if (tokenFromUri) {
    if (isDev) {
      console.log("[Authdog] Processing token from URL");
    }
    const authenticatedUser = await fetchUserData(
      publicKeyObj?.identityHost,
      publicKeyObj?.environmentId,
      tokenFromUri,
    );

    if (isDev) {
      console.log("[Authdog] Token authentication result:", {
        success: !!authenticatedUser,
        hasUser: !!authenticatedUser?.user,
        metaCode: authenticatedUser?.meta?.code,
      });
    }

    if (isAuthenticatedUserInfo(authenticatedUser)) {
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

      return jsonResponse(
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
  if (isDev) {
    console.log("[Authdog] Attempting cookie authentication");
  }
  const cookieAuthResult = await authenticateWithCookies(request, publicKeyObj);
  if (cookieAuthResult) {
    if (isDev) {
      console.log("[Authdog] Cookie authentication successful");
    }
    return cookieAuthResult;
  }

  if (isDev) {
    console.log(
      "[Authdog] No authentication methods succeeded, returning unauthenticated",
    );
  }
  // If we get here, we're not authenticated
  return jsonResponse({
    user: null,
    isAuthenticated: false,
    signinUri: `${publicKeyObj.identityHost}/signin/${publicKeyObj.environmentId}`,
  });
};
