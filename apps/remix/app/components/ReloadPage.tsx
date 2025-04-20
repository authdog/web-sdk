import { useEffect } from "react";

export const ReloadPage = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");

      if (token) {
        // Remove token from URL without triggering a page reload
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.toString());
        window.location.reload();
        return;
      }
    }
  }, []);
  return null;
};
