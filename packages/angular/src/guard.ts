import { inject } from "@angular/core";
import { Router, type CanActivateFn, type UrlTree } from "@angular/router";
import { AuthdogService } from "./service";
import { AUTHDOG_CONFIG } from "./tokens";

/**
 * ⚠️ PRESENTATIONAL / UX ONLY — NOT A SECURITY BOUNDARY.
 *
 * This guard prevents an unauthenticated user from *navigating* to a route in
 * the SPA so they see a login redirect instead of a broken page. It runs
 * entirely in the browser and is therefore trivially bypassable by any client
 * (devtools, crafted requests, a patched bundle). It MUST NOT be relied on to
 * protect data or actions.
 *
 * Every protected operation MUST be independently enforced server-side: the
 * API behind the route has to validate the session on each request regardless
 * of what this guard decides.
 */
export const authdogGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthdogService);
  const router = inject(Router);
  const config = inject(AUTHDOG_CONFIG);

  // A token is sufficient for *navigation* — fetching the user is async and
  // we don't want to block routing on a network round-trip.
  if (auth.token()) {
    return true;
  }

  return router.parseUrl(config.loginPath ?? "/");
};
