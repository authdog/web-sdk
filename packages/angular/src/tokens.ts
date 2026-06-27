import { InjectionToken } from "@angular/core";

export interface AuthdogConfig {
  /**
   * Authdog public key (`pk_…`). Safe to expose to the browser. Used as the
   * `client_id` and to derive the identity host / environment for OIDC flows.
   */
  publicKey: string;

  /**
   * Path the route guard redirects to when the user is not authenticated.
   * Defaults to `/`.
   */
  loginPath?: string;
}

/** DI token carrying the SDK configuration provided via `provideAuthdog`. */
export const AUTHDOG_CONFIG = new InjectionToken<AuthdogConfig>(
  "AUTHDOG_CONFIG",
);
