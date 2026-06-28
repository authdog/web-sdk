import { createAuthdogServer } from "@authdog/sveltekit/server";
import type { PageServerLoad } from "./$types";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY ?? "",
});

// Resolve the full user profile from the identity host using the session
// cookie. Returns null when there is no valid session.
export const load: PageServerLoad = async ({ request, locals }) => {
  const profile = locals.authdog.isAuthenticated
    ? await authdog.getUser(request).catch(() => null)
    : null;

  return { user: profile?.user ?? null };
};
