import { createAuthdogHandle } from "@authdog/sveltekit/server";

// Populates `event.locals.authdog` ({ session, isAuthenticated }) on every request.
export const handle = createAuthdogHandle({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY ?? "",
});
