/** Shared localStorage key for the persisted token. */
export const TOKEN_STORAGE_KEY = "token";

/** JWT shape: three base64url segments separated by dots. */
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const getTokenFromUri = (url: string): string | null => {
  return new URL(url).searchParams.get("token");
};

export const validatePublicKey = (publicKey: string): void => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }
  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }
};

/**
 * Browser bootstrap for Gatsby pages / inline scripts.
 *
 * Consumes a `?token=…` query param left by the login redirect (persisting it
 * to localStorage and reloading so the server can pick up the cookie),
 * otherwise returns any previously persisted token. Returns null on the server
 * or when no token is available.
 */
export const initAuthdog = (): string | null => {
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
