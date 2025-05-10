"use client";

import React, { useEffect } from "react";
import { AuthdogProvider } from "@authdog/remix-node";

export const Client = (App: React.ComponentType<any>) => {
  return function ClientWrapper() {
    useEffect(() => {
      // Check if we're in the browser
      // if (typeof window !== "undefined") {
      //   // Check if there's a token in the URL
      //   const url = new URL(window.location.href);
      //   const token = url.searchParams.get("token");

      //   // if (token) {
      //   //   // Remove token from URL without triggering a page reload
      //   //   url.searchParams.delete("token");
      //   //   window.history.replaceState({}, document.title, url.toString());
      //   // }
      // }
    }, []);

    return (
      <AuthdogProvider>
        <App />
      </AuthdogProvider>
    );
  };
};
