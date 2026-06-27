import { useEffect } from "react";

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
