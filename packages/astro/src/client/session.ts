import { getPublicKeyPayload } from "../commons";

/** Shared localStorage key for the persisted token. */
export const TOKEN_STORAGE_KEY = "token";

/** JWT shape: three base64url segments separated by dots. */
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const getTokenFromUri = (url: string): string | null => {
  return new URL(url).searchParams.get("token");
};

export const validatePublicKey = (publicKey: string) => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }
};

/**
 * Framework-agnostic client bootstrap for Astro islands / inline scripts.
 *
 * Runs in the browser: consumes a `?token=…` query param left by the login
 * redirect (persisting it to localStorage and reloading so the server can pick
 * up the cookie), otherwise returns any previously persisted token. Returns
 * null on the server or when no token is available.
 *
 * ```astro
 * <script>
 *   import { initAuthdog } from "@authdog/astro/client";
 *   const token = initAuthdog();
 * </script>
 * ```
 */
export const initAuthdog = (): string | null => {
  // No-op on the server.
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(window.location.href);
  const urlToken = url.searchParams.get("token");

  if (urlToken) {
    // Remove the token from the URL without a reload, regardless of validity.
    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, url.toString());

    // Only persist values that look like a JWT to avoid storing arbitrary
    // attacker-supplied data.
    if (JWT_PATTERN.test(urlToken)) {
      localStorage.setItem(TOKEN_STORAGE_KEY, urlToken);
      // Force a reload so the server processes the freshly stored token.
      window.location.reload();
      return urlToken;
    }
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/** Removes the persisted token from localStorage (client-side sign-out). */
export const clearAuthdogToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

/**
 * Fetches the authenticated user's profile from the identity host's OIDC
 * userinfo endpoint, deriving the host/environment from the public key.
 */
export const fetchUserData = async (publicKey: string, token: string) => {
  validatePublicKey(publicKey);
  const { identityHost, environmentId } = getPublicKeyPayload(publicKey);

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

  return await userData.json();
};

// NOTE: These options are for cookies usable from the browser. `httpOnly` is
// intentionally omitted — it is a no-op (and misleading) for client-set
// cookies since JS cannot set HttpOnly. Session cookies should be set
// server-side with HttpOnly; do not set session cookies from client JS.
export const browserCookiesOptions = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  secure: true,
  sameSite: "lax" as const,
};
