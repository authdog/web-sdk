## tanstack-start

Authdog TanStack Start SDK

## Use session

Run the auth loader from a server route (or server function) to resolve the
current session. It returns a Web `Response` with the user payload and, on first
sign-in, the hardened HttpOnly session cookies.

```ts
// app/routes/index.tsx
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { identityLoader } from "@authdog/tanstack-start";

const loadIdentity = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();
  const response = await identityLoader()({ request });
  return response.json();
});
```

## Provider

Wrap your app so a `?token=…` returned by Universal Login is stripped from the
URL after the server persists the session:

```tsx
import { AuthdogProvider } from "@authdog/tanstack-start/client";

<AuthdogProvider>{children}</AuthdogProvider>;
```

## Logout

```ts
import { logoutLoader } from "@authdog/tanstack-start";

// returns a 302 Response that clears the session cookies
export const logout = () => logoutLoader();
```
