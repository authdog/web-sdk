import React, { useEffect } from "react";

export const AuthdogProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      if (token) {
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.toString());
      }
    }, []);
  
    return <>{children}</>;
}