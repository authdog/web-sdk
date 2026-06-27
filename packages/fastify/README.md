# @authdog/fastify

**Authdog SDK for [Fastify](https://fastify.dev).**

A tiny, high-performance plugin that validates Authdog sessions on every
request and gives you an idiomatic `request.authdog` context plus a
`requireAuth` guard — built on [`@authdog/node-commons`](../node-commons).

- 🔌 **Drop-in plugin** — `app.register(authdogPlugin, { publicKey })`.
- 🔐 **Secure by default** — public key (and its identity host) validated once
  at registration; tokens only trusted after the identity host confirms them.
- 🧱 **No assumptions** — parses cookies itself; `@fastify/cookie` not required.
- 🟦 **Typed** — `request.authdog` and `app.authdog` are fully typed via module
  augmentation.

## Install

```bash
bun add @authdog/fastify fastify
```

Set your Authdog public key (safe to expose):

```bash
AUTHDOG_PK=pk_xxxxxxxxxxxxxxxx
```

## Usage

```ts
import Fastify from "fastify";
import { authdogPlugin } from "@authdog/fastify";

const app = Fastify();

await app.register(authdogPlugin, {
  publicKey: process.env.AUTHDOG_PK!,
});

// Every request now carries `request.authdog` ({ token, user, isAuthenticated }).
app.get("/", async (request) => {
  return request.authdog?.isAuthenticated
    ? `Hello ${JSON.stringify(request.authdog.user)}`
    : "Not signed in";
});

// Protect a route with the built-in guard (the real enforcement point).
app.get(
  "/me",
  { preHandler: app.authdog.requireAuth },
  async (request) => request.authdog!.user,
);

// Logout: clears the session cookie and redirects to a sanitized ?redirect_uri.
app.get("/logout", (request, reply) => app.authdog.logout(request, reply));

await app.listen({ port: 3000 });
```

### Token resolution

On each request the plugin looks for a token in this order:

1. The `authdog-session` cookie.
2. An `Authorization: Bearer <token>` header.

If a token is found it is verified against the identity host's `userinfo`
endpoint and, on success, `request.authdog.isAuthenticated` becomes `true` and
`request.authdog.user` is populated. A missing or invalid token never throws —
it simply yields an unauthenticated context.

### Options

| Option          | Type      | Default | Description                                                                 |
| --------------- | --------- | ------- | --------------------------------------------------------------------------- |
| `publicKey`     | `string`  | —       | Authdog public key (`pk_…`). Required.                                      |
| `secretKey`     | `string`  | —       | Reserved for future server-side session revocation. Currently unused.       |
| `fetchUserInfo` | `boolean` | `true`  | When `false`, skips the per-request `userinfo` call (token is not verified). |

> ⚠️ `request.authdog` is informational. Always gate protected routes with
> `app.authdog.requireAuth` (or your own check on `isAuthenticated`).

## License

MIT
