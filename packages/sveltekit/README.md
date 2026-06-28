# @authdog/sveltekit

Authdog SvelteKit SDK for authentication and user management.

Built for SvelteKit's server model: a `handle` hook + framework-agnostic server
helpers manage sessions on the server, and a tiny vanilla client bootstrap
handles the login redirect — no UI peer dependency beyond SvelteKit itself.

## Installation

```bash
bun add @authdog/sveltekit
```

## Usage

### Server hook

Wire the hook once so every request gets `event.locals.authdog`:

```ts
// src/hooks.server.ts
import { createAuthdogHandle } from "@authdog/sveltekit/server";

export const handle = createAuthdogHandle({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
});
```

Composing with other hooks? Use `sequence`:

```ts
import { sequence } from "@sveltejs/kit/hooks";
import { createAuthdogHandle } from "@authdog/sveltekit/server";

export const handle = sequence(
  createAuthdogHandle({ publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY }),
  myOtherHandle,
);
```

Augment `App.Locals` for typed access:

```ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      authdog: import("@authdog/sveltekit/server").AuthdogLocals;
    }
  }
}

export {};
```

### Server-side (`load`, actions, `+server.ts`)

```ts
// src/routes/profile/+page.server.ts
import { createAuthdogServer } from "@authdog/sveltekit/server";
import type { PageServerLoad } from "./$types";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
});

export const load: PageServerLoad = async ({ request, locals }) => {
  const user = locals.authdog.isAuthenticated
    ? await authdog.getUser(request).catch(() => null)
    : null;

  return { user: user?.user ?? null };
};
```

### Logout endpoint

```ts
// src/routes/logout/+server.ts
import { createAuthdogServer } from "@authdog/sveltekit/server";
import type { RequestHandler } from "./$types";

const authdog = createAuthdogServer({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
});

// Clears the session cookie and redirects (honors a sanitized ?redirect_uri).
export const GET: RequestHandler = ({ request }) => authdog.logout(request);
```

### Client-side bootstrap

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from "svelte";
  import { initAuthdog } from "@authdog/sveltekit/client";

  // Consume ?token=… from the login redirect, persist it, then reload.
  onMount(() => initAuthdog());
</script>
```

## API Reference

### Server

- `createAuthdogHandle(config)` — SvelteKit `handle` hook that populates `event.locals.authdog`
- `createAuthdogServer(config)` — server instance (`getSession`, `getUser`, `getPublicKey`, `logout`)
- `getSessionCookie(request, cookieName?)` — read the raw session token
- `logoutHandler(request, cookieName?)` — build a cookie-clearing redirect response
- `getServerSidePayloadPublicKey(publicKey)` — validate the public key

### Client

- `initAuthdog()` — handle the `?token=…` login redirect and persist the token
- `clearAuthdogToken()` — client-side sign-out (clears localStorage)
- `fetchUserData(publicKey, token)` — fetch the user profile from the identity host
- `getTokenFromUri(url)`, `validatePublicKey(publicKey)`, `browserCookiesOptions`
