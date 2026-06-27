import { type ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
  provideHttpClient,
  withInterceptors,
  type HttpInterceptorFn,
} from "@angular/common/http";
import { provideAuthdog, authdogInterceptor } from "@authdog/angular";
import { routes } from "./app.routes";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // The interceptor is registered here so it composes with the app's own
    // HttpClient configuration. It attaches `Authorization: Bearer <token>`
    // to outgoing requests when a session token is present.
    //
    // The `as HttpInterceptorFn` cast is only needed inside this monorepo,
    // where two copies of `@angular/common` can coexist (the SDK's dev tree and
    // this example's). A normal app that depends on a single `@angular/common`
    // does not need it — `withInterceptors([authdogInterceptor])` is enough.
    provideHttpClient(
      withInterceptors([authdogInterceptor as HttpInterceptorFn]),
    ),
    provideAuthdog({
      publicKey: environment.authdogPublicKey,
      // Where `authdogGuard` redirects unauthenticated navigation attempts.
      loginPath: "/",
    }),
  ],
};
