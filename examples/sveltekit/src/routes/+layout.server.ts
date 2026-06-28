import type { LayoutServerLoad } from "./$types";

// Expose the session state from the Authdog hook to every page's layout.
export const load: LayoutServerLoad = ({ locals }) => {
  return { isAuthenticated: locals.authdog.isAuthenticated };
};
