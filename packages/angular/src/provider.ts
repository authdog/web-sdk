import {
  type EnvironmentProviders,
  type Provider,
  makeEnvironmentProviders,
} from "@angular/core";
import { AUTHDOG_CONFIG, type AuthdogConfig } from "./tokens";
import { AuthdogService } from "./service";

/**
 * Wires the Authdog SDK into a standalone Angular application.
 *
 * Add to `ApplicationConfig.providers`:
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAuthdog({ publicKey: environment.authdogPublicKey }),
 *     provideHttpClient(withInterceptors([authdogInterceptor])),
 *   ],
 * };
 * ```
 *
 * Note: the HTTP interceptor is registered by the consumer via
 * `withInterceptors([authdogInterceptor])` so it composes with the app's own
 * `provideHttpClient` setup rather than forcing a particular configuration.
 */
export const provideAuthdog = (
  config: AuthdogConfig,
): EnvironmentProviders => {
  const providers: Provider[] = [
    { provide: AUTHDOG_CONFIG, useValue: config },
    AuthdogService,
  ];

  return makeEnvironmentProviders(providers);
};
