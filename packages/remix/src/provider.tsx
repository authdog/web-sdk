import React, { useEffect, useState } from "react";

export const AuthdogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Check if there's a token in the URL
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");

      if (token) {
        // Remove token from URL without triggering a page reload
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.toString());

        // Force a reload to ensure the server processes the token
        window.location.reload();
        return;
      }

      // If no token, we're done loading
      setIsLoading(false);
    } else {
      // If we're on the server, don't show loading state
      setIsLoading(false);
    }
  }, []);

  // Show children while loading (don't return null)
  return <>{children}</>;
};

export const ReloadPage = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      if (token) {
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.toString());
        localStorage.setItem("token", token);
        return;
      }
    }
  }, []);
  return null;
};
