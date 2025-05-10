"use client";

import React from "react";
import { AuthdogProvider } from "@authdog/remix-node";

export const Client = (App: React.ComponentType<any>) => {
  return function ClientWrapper() {
    return (
      <AuthdogProvider>
        <App />
      </AuthdogProvider>
    );
  };
};
