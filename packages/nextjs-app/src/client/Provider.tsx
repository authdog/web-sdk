"use client";

import React, { useEffect } from "react";

import {
  TOKEN_STORAGE_KEY,
  TOKEN_UPDATED_EVENT,
} from "./constants";

export const AuthdogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
      window.history.replaceState({}, document.title, "/");
    }
  }, []);
  return <>{children}</>;
};
