"use client";
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
    }
  }, []);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};
