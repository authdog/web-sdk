import { inject } from "@angular/core";
import type { HttpInterceptorFn } from "@angular/common/http";
import { AuthdogService } from "./service";

/**
 * Functional HTTP interceptor that attaches `Authorization: Bearer <token>`
 * to outgoing requests when a session token is present. Register it with
 * `provideAuthdog()` or directly via `provideHttpClient(withInterceptors([authdogInterceptor]))`.
 *
 * Requests that already carry an `Authorization` header are left untouched.
 */
export const authdogInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthdogService);
  const token = auth.token();

  if (!token || req.headers.has("Authorization")) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
