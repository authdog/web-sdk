import React, { useEffect } from "react";

/**
 * Client provider for Gatsby apps. On mount it strips a `?token=…` left by the
 * login redirect from the URL. The raw token is never persisted in the DOM: the
 * server exchanges it for an HttpOnly session cookie, so the client only needs
 * to clean up the URL and reload once so the cookie is picked up.
 *
 * Wrap your app in `gatsby-browser.js` / `gatsby-ssr.js` via `wrapRootElement`:
 *
 * ```tsx
 * import { AuthdogProvider } from "@authdog/gatsby/client";
 * export const wrapRootElement = ({ element }) => (
 *   <AuthdogProvider>{element}</AuthdogProvider>
 * );
 * ```
 */
export const AuthdogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      // Strip the token from the URL without a reload, then reload so the
      // server processes it and persists the HttpOnly session cookie.
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
      window.location.reload();
    }
  }, []);

  return <>{children}</>;
};

/**
 * Utility component that strips a lingering `?token=…` from the URL without
 * forcing a reload — useful on a dedicated callback route.
 */
export const ReloadPage = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("token")) {
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);
  return null;
};
