import { createAuthdogServer } from "@authdog/sveltekit/server";
import type { RequestHandler } from "./$types";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY ?? "",
});

// Clears the session cookie and redirects (honors a sanitized ?redirect_uri).
export const GET: RequestHandler = ({ request }) => authdog.logout(request);
