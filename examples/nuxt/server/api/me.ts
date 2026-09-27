import { getServerSession, logoutResponse } from "@authdog/nuxt/server";

/** Reads the session token from a Nitro-style event. Presence is not authorization. */
export const readSession = (cookieHeader: string | undefined): string | null =>
  getServerSession({ headers: { cookie: cookieHeader } });

/** Clears the session cookie and redirects to a sanitized in-app path. */
export const logout = (request: Request): Response => logoutResponse(request);
