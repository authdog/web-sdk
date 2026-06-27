"use client";

import React, { useEffect } from "react";

import { TOKEN_STORAGE_KEY, TOKEN_UPDATED_EVENT } from "./constants";

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const AuthdogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      if (JWT_PATTERN.test(token)) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
      }
      // Always strip the token from the URL, even if it was rejected.
      window.history.replaceState({}, document.title, "/");
    }
  }, []);
  return <>{children}</>;
};
