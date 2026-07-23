# @authdog/nuxt

Authdog SDK for [Nuxt](https://nuxt.com) — a Vue plugin, auth composables
(`useSession`, `useUser`, `useSignIn`, `useSignUp`, `useSignOut`), and
server-side session helpers. Built on
[`@authdog/node-commons`](../node-commons), so public-key parsing, cookie
handling, and the trusted identity-host allowlist are shared with the rest of
the Authdog Web SDK.

## Install

```bash
bun add @authdog/nuxt
```

`vue` (provided by Nuxt) is the only peer dependency.

## Setup

Register the plugin from a Nuxt plugin file:

```ts
// plugins/authdog.ts
import { createAuthdog } from "@authdog/nuxt";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  nuxtApp.vueApp.use(
    createAuthdog({ publicKey: config.public.authdogPublicKey as string }),
  );
});
```

## Composables

```vue
<script setup lang="ts">
import { useSession, useUser, useSignIn, useSignOut } from "@authdog/nuxt";

const { session, isLoading } = useSession();
const { user, load } = useUser();
const { signIn } = useSignIn();
const { signOut } = useSignOut();
</script>

<template>
  <button v-if="!session.isAuthenticated" @click="signIn()">Sign in</button>
  <template v-else>
    <button @click="load()">Load profile</button>
    <button @click="signOut('/')">Sign out</button>
    <pre>{{ user }}</pre>
  </template>
</template>
```

- **`useSession()`** — `{ session: { token, isAuthenticated }, isLoading }`.
- **`useUser()`** — `{ user, isLoading, error, isAuthenticated, load }`; `load()`
  calls the OIDC `userinfo` endpoint and never throws.
- **`useSignIn()` / `useSignUp()`** — redirect to the OIDC `authorize` flow
  (sign-up adds `prompt=signup`).
- **`useSignOut()`** — clears the token and optionally navigates.

On the client the plugin consumes a `?token=` from the URL after sign-in,
persisting JWT-shaped values to `localStorage` and reloading once.

## Server

For Nitro server routes, read the session and clear it from
`@authdog/nuxt/server`:

```ts
// server/api/me.ts
import { getServerSession } from "@authdog/nuxt/server";

export default defineEventHandler((event) => {
  const token = getServerSession(event);
  return { authenticated: !!token };
});
```

`getServerSession(event)` accepts an H3 event or a Web `Request`.
`logoutResponse(request)` returns a `302` that clears the `authdog-session`
cookie and redirects to a sanitized `redirect_uri`.
`getServerSidePayloadPublicKey(publicKey)` returns the validated payload as JSON.

## Security

- The public key is validated and parsed **once**; a malformed or untrusted key
  (identity host not on the allowlist) throws immediately.
- Only JWT-shaped tokens are persisted client-side, and the token is only ever
  sent to the trusted, `https:` identity host enforced by `@authdog/node-commons`.
- Composable auth state is a UI hint. Enforce every protected operation
  server-side.

## License

MIT
