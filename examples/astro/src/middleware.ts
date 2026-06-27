import { defineMiddleware } from "astro:middleware";
import { authdogMiddleware } from "@authdog/astro/server";

// Populates `Astro.locals.authdog` ({ session, isAuthenticated }) on every request.
export const onRequest = defineMiddleware(
  authdogMiddleware({
    publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY ?? "",
  }),
);
