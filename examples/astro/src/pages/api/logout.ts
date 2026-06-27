import type { APIRoute } from "astro";
import { createAuthdogServer } from "@authdog/astro/server";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY ?? "",
});

// Clears the session cookie and redirects (honors a sanitized ?redirect_uri).
export const GET: APIRoute = ({ request }) => authdog.logout(request);
