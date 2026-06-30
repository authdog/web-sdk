<div align="center">

# Authdog Web SDK

**Drop-in authentication and identity for modern web frameworks.**

A curated monorepo of framework-native libraries that make it effortless to add
secure sessions, user management, and auth UI to your React, Next.js, Remix,
TanStack Start, Vue, Astro, SvelteKit, Angular, React Native, and Node
(Express / Fastify) applications — plus backend SDKs for **Python** (FastAPI,
Flask, Django, Starlette, aiohttp), **Go** (Gin), **Rust** (axum, actix-web,
Rocket, warp, poem), and **Kotlin** (Ktor) that speak the same session protocol.

[![packages-publish](https://github.com/authdog/web-sdk/actions/workflows/packages-publish.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/packages-publish.yml)
[![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

[Quick Start](#-quick-start) · [Packages](#-packages) · [Examples](#-examples) · [Development](#-development) · [Contributing](#-contributing)

</div>

---

## ✨ Why Authdog Web SDK?

- **🧩 Framework-native** — idiomatic packages for React, Next.js (App Router), Remix, TanStack Start, Vue, Astro, SvelteKit, Angular, React Native, and Node backends (Express / Fastify), plus Python (FastAPI, Flask, Django, Starlette, aiohttp), Go (Gin), Rust (axum, actix-web, Rocket, warp, poem), and Kotlin (Ktor) backends. No glue code.
- **🌍 Polyglot backends** — Node, Python, Go, Rust, and Kotlin services share one `authdog-session` cookie, one OIDC `userinfo` flow, and one trusted identity-host allowlist, so a single Authdog environment works across your whole stack.
- **🔐 Secure by default** — token validation, cookie handling, and session lifecycle managed for you.
- **🎨 Batteries-included UI** — ready-made, accessible components (sign-in, user profile, TOTP, navbar) you can drop in or restyle.
- **⚡ Tiny & tree-shakeable** — ESM-first, `sideEffects: false`, dual CJS/ESM builds via [tsup](https://tsup.egoist.dev).
- **🟦 Type-safe end to end** — written in TypeScript with first-class types shipped in every package.
- **🌐 Server & client split** — explicit `/client` and `/server` entry points keep secrets server-side.

## 📦 Packages

| Package | Version | CI | Description |
| ------- | ------- | -- | ----------- |
| [`@authdog/react-elements`](packages/react-elements) | [![npm](https://img.shields.io/npm/v/@authdog/react-elements)](https://www.npmjs.com/package/@authdog/react-elements) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Accessible React UI components — buttons, navbar, user profile & dropdown, TOTP validator. |
| [`@authdog/nextjs-app`](packages/nextjs-app) | [![npm](https://img.shields.io/npm/v/@authdog/nextjs-app)](https://www.npmjs.com/package/@authdog/nextjs-app) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Next.js **App Router** SDK — provider, `useUser` / `useAuth` hooks, server helpers. |
| [`@authdog/remix-node`](packages/remix) | [![npm](https://img.shields.io/npm/v/@authdog/remix-node)](https://www.npmjs.com/package/@authdog/remix-node) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Remix SDK — auth loaders, provider, and cookie-based session helpers. |
| [`@authdog/tanstack-start`](packages/tanstack-start) | [![npm](https://img.shields.io/npm/v/@authdog/tanstack-start)](https://www.npmjs.com/package/@authdog/tanstack-start) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | TanStack Start SDK — auth loader, provider, and cookie-based session helpers. |
| [`@authdog/vue`](packages/vue) | [![npm](https://img.shields.io/npm/v/@authdog/vue)](https://www.npmjs.com/package/@authdog/vue) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Vue SDK — provider component and `useSession` / `useUser` composables. |
| [`@authdog/astro`](packages/astro) | [![npm](https://img.shields.io/npm/v/@authdog/astro)](https://www.npmjs.com/package/@authdog/astro) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Astro SDK — session middleware (`Astro.locals.authdog`), server helpers, and a vanilla client bootstrap. |
| [`@authdog/sveltekit`](packages/sveltekit) | [![npm](https://img.shields.io/npm/v/@authdog/sveltekit)](https://www.npmjs.com/package/@authdog/sveltekit) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | SvelteKit SDK — session `handle` hook (`event.locals.authdog`), server helpers, and a vanilla client bootstrap. |
| [`@authdog/angular`](packages/angular) | [![npm](https://img.shields.io/npm/v/@authdog/angular)](https://www.npmjs.com/package/@authdog/angular) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Angular SDK — `provideAuthdog()`, signals-based `AuthdogService`, HTTP interceptor & route guard. |
| [`@authdog/express`](packages/express) | [![npm](https://img.shields.io/npm/v/@authdog/express)](https://www.npmjs.com/package/@authdog/express) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Express SDK — session middleware, `requireAuth` guard, and logout handler. |
| [`@authdog/fastify`](packages/fastify) | [![npm](https://img.shields.io/npm/v/@authdog/fastify)](https://www.npmjs.com/package/@authdog/fastify) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Fastify SDK — plugin decorating requests with session + `requireAuth` / `logout`. |
| [`@authdog/react-native`](packages/react-native) | [![npm](https://img.shields.io/npm/v/@authdog/react-native)](https://www.npmjs.com/package/@authdog/react-native) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | React Native / Expo SDK — provider, hooks, pluggable secure storage & deep-link login. |
| [`@authdog/node-commons`](packages/node-commons) | [![npm](https://img.shields.io/npm/v/@authdog/node-commons)](https://www.npmjs.com/package/@authdog/node-commons) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Shared Node utilities — public-key parsing, cookies, sessions, identity. |

### Backend SDKs for other languages

| Package | Registry | CI | Description |
| ------- | -------- | -- | ----------- |
| [`authdog-fastapi`](packages/python) | [PyPI](https://pypi.org/project/authdog-fastapi) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Python SDK — idiomatic **FastAPI**, **Flask**, **Django**, **Starlette**, and **aiohttp** bindings (`session`, `require_auth` gate, and logout) over one framework-agnostic core. |
| [`authdog` (Go)](packages/go) | `github.com/authdog/web-sdk/packages/go` | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Go SDK with **Gin** middleware — `AttachSession`, `RequireAuth`, and `Logout`. |
| [`authdog-axum` & friends](packages/rust) | [crates.io](https://crates.io/crates/authdog-axum) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Rust workspace — `authdog-core` plus per-framework crates `authdog-axum`, `authdog-actix`, `authdog-rocket`, `authdog-warp`, `authdog-poem` (`attach_session`, `AuthContext`, `require_auth`, `logout`). |
| [`authdog-ktor`](packages/kotlin) | [Maven Central](https://search.maven.org/artifact/com.authdog/authdog-ktor) | [![CI](https://github.com/authdog/web-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/ci.yml) | Kotlin / **Ktor** SDK — `resolve` session, `requireAuth` gate, and `logout`. |

These backend SDKs mirror the Node `@authdog/express` / `@authdog/fastify`
packages on the wire (same `authdog-session` cookie, same `userinfo` flow, same
identity-host allowlist), so they validate sessions issued for the same Authdog
environment.

## 🚀 Quick Start

Pick the package for your framework and install it with your favorite package manager:

```bash
# Next.js (App Router)
bun add @authdog/nextjs-app @authdog/react-elements

# Remix
bun add @authdog/remix-node @authdog/react-elements

# TanStack Start
bun add @authdog/tanstack-start @authdog/react-elements

# Vue
bun add @authdog/vue

# Astro
bun add @authdog/astro

# SvelteKit
bun add @authdog/sveltekit

# Angular
bun add @authdog/angular

# Express (backend)
bun add @authdog/express

# Fastify (backend)
bun add @authdog/fastify

# React Native / Expo
bun add @authdog/react-native
```

Backend SDKs for other languages install with their native package managers:

```bash
# Python — one install, pick your framework's extra
pip install "authdog-fastapi[fastapi]"   # or [flask], [django], [starlette], [aiohttp]

# Go (Gin)
go get github.com/authdog/web-sdk/packages/go@latest

# Rust — add the crate for your framework to Cargo.toml
cargo add authdog-axum    # or authdog-actix / authdog-rocket / authdog-warp / authdog-poem

# Kotlin (Ktor) — add to build.gradle.kts
# implementation("com.authdog:authdog-ktor:0.1.0")
```

Provide your Authdog public key (`pk_…`). Each framework reads it from a different
place — use the variable that matches your package:

| Framework            | Variable                 | Where it's read                          |
| -------------------- | ------------------------ | ---------------------------------------- |
| Next.js (client)     | `NEXT_PUBLIC_PK_AUTHDOG` | Exposed to the browser by Next.js        |
| Next.js (server)     | `PK_AUTHDOG`             | Server-only (logout, etc.)               |
| Remix                | `PK_AUTHDOG`             | Loaders / actions                        |
| TanStack Start       | `PK_AUTHDOG`             | Server functions / route loaders         |
| Express (backend)    | `PK_AUTHDOG`             | `createAuthdog({ publicKey })`           |
| Fastify (backend)    | `AUTHDOG_PK`             | `authdogPlugin({ publicKey })`           |
| Vue                  | `VITE_AUTHDOG_PUBLIC_KEY`| Vite-exposed (use the `VITE_` prefix)    |
| Astro                | `PUBLIC_AUTHDOG_PUBLIC_KEY`| Exposed via Astro's `PUBLIC_` prefix   |
| SvelteKit            | `PUBLIC_AUTHDOG_PUBLIC_KEY`| Exposed via SvelteKit's `PUBLIC_` prefix |
| React Native / Expo  | `EXPO_PUBLIC_PK_AUTHDOG` | Exposed to the app by Expo               |
| Angular              | —                        | Passed directly to `provideAuthdog(...)` |
| Python (all)         | `PK_AUTHDOG`             | `Authdog(public_key=...)`                |
| Go (Gin)             | `PK_AUTHDOG`             | `authdog.New(authdog.Config{PublicKey})` |
| Rust (all)           | `PK_AUTHDOG`             | `Authdog::new(...)`                      |
| Kotlin (Ktor)        | `PK_AUTHDOG`             | `Authdog(System.getenv("PK_AUTHDOG"))`   |

```bash
# Next.js (App Router)
NEXT_PUBLIC_PK_AUTHDOG=pk_xxxxxxxxxxxxxxxx
```

> Your public key (`pk_…`) is available in the [Authdog dashboard](https://authdog.com).
> It is safe to expose to the browser. Your **secret key** (`sk_…`), used only by
> backend packages, must never be committed or shipped to the client.

## 🧪 Examples

### Next.js (App Router)

Wrap your app with the provider in `app/layout.tsx`:

```tsx
import "@authdog/react-elements/styles.css";
import { AuthdogProvider } from "@authdog/nextjs-app/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthdogProvider>{children}</AuthdogProvider>
      </body>
    </html>
  );
}
```

Read the current user from any client component:

```tsx
"use client";
import { useUser } from "@authdog/nextjs-app";
import { UserProfile } from "@authdog/react-elements";

export default function Profile() {
  const { user, isLoading } = useUser();
  return <UserProfile loading={isLoading} user={user} />;
}
```

### Vue

```vue
<script setup lang="ts">
import { AuthdogProvider } from "@authdog/vue/client";
import { useUser } from "@authdog/vue";

const { user, isLoading } = useUser();
</script>

<template>
  <AuthdogProvider>
    <p v-if="isLoading">Loading…</p>
    <p v-else>Welcome, {{ user?.name }}</p>
  </AuthdogProvider>
</template>
```

### Astro

Wire the middleware once (SSR mode), then read the session anywhere via
`Astro.locals.authdog`:

```ts
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { authdogMiddleware } from "@authdog/astro/server";

export const onRequest = defineMiddleware(
  authdogMiddleware({ publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY }),
);
```

```astro
---
// src/pages/profile.astro
import { createAuthdogServer } from "@authdog/astro/server";

const authdog = createAuthdogServer({ publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY });
const user = Astro.locals.authdog.isAuthenticated ? await authdog.getUser(Astro.request) : null;
---

{user ? <p>Welcome, {user.user?.displayName}</p> : <a href="/login">Sign in</a>}
```

### SvelteKit

Wire the `handle` hook once, then read the session anywhere via
`event.locals.authdog`:

```ts
// src/hooks.server.ts
import { createAuthdogHandle } from "@authdog/sveltekit/server";

export const handle = createAuthdogHandle({
  publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY,
});
```

```ts
// src/routes/profile/+page.server.ts
import { createAuthdogServer } from "@authdog/sveltekit/server";
import type { PageServerLoad } from "./$types";

const authdog = createAuthdogServer({ publicKey: import.meta.env.PUBLIC_AUTHDOG_PUBLIC_KEY });

export const load: PageServerLoad = async ({ request, locals }) => {
  const user = locals.authdog.isAuthenticated ? await authdog.getUser(request) : null;
  return { user: user?.user ?? null };
};
```

### Remix

```ts
// app/routes/_index.tsx
import { remixAuthLoader } from "@authdog/remix-node";

export const loader = remixAuthLoader;
```

### TanStack Start

Resolve the session from a server function (TanStack Start speaks the Web Fetch
API, so the loader returns a standard `Response`):

```ts
// app/routes/index.tsx
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { identityLoader } from "@authdog/tanstack-start";

export const loadIdentity = createServerFn({ method: "GET" }).handler(async () => {
  const response = await identityLoader()({ request: getWebRequest() });
  return response.json();
});
```

Wrap your app with the provider (strips the `?token=…` from the URL after the
server persists the session):

```tsx
import { AuthdogProvider } from "@authdog/tanstack-start/client";

<AuthdogProvider>{children}</AuthdogProvider>;
```

### Angular

Register the SDK (standalone, `app.config.ts`) and add the interceptor to your `HttpClient`:

```ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAuthdog, authdogInterceptor } from "@authdog/angular";

export const appConfig = {
  providers: [
    provideAuthdog({ publicKey: "pk_xxxxxxxxxxxxxxxx" }),
    provideHttpClient(withInterceptors([authdogInterceptor])),
  ],
};
```

Read auth state from the signals-based `AuthdogService`:

```ts
import { Component, inject } from "@angular/core";
import { AuthdogService } from "@authdog/angular";

@Component({ /* … */ })
export class ProfileComponent {
  readonly auth = inject(AuthdogService);
  // auth.isLoading(), auth.token(), auth.user() — signals
  // auth.signIn(), auth.signUp(), auth.signOut(), auth.fetchUser()
}
```

### Express

```ts
import express from "express";
import { createAuthdog } from "@authdog/express";

const app = express();
const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });

app.use(authdog.attachSession()); // resolves `req.authdog` for every request
app.get("/me", authdog.requireAuth, (req, res) => res.json(req.authdog!.user));
app.get("/logout", authdog.logout);
```

### Fastify

```ts
import Fastify from "fastify";
import { authdogPlugin } from "@authdog/fastify";

const app = Fastify();
await app.register(authdogPlugin, { publicKey: process.env.AUTHDOG_PK! });

// `request.authdog` is now available everywhere; `app.authdog.requireAuth`
// is the server-side enforcement point.
app.get("/me", { preHandler: app.authdog.requireAuth }, async (req) => req.authdog!.user);
app.get("/logout", (req, reply) => app.authdog.logout(req, reply));
```

### Python (FastAPI)

```python
import os
from fastapi import Depends, FastAPI, Request
from authdog.fastapi import Authdog

app = FastAPI()
authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])

@app.get("/me")
async def me(user=Depends(authdog.require_auth)):  # require_auth is the gate
    return user

@app.get("/logout")
async def logout(request: Request):
    return authdog.logout(request)
```

The same `Authdog` surface ships for other Python frameworks — import the
matching module: `authdog.flask` (`@authdog.require_auth` decorator),
`authdog.django` (middleware + decorator), `authdog.starlette` (ASGI
middleware), or `authdog.aiohttp` (`@web.middleware`). All share one
framework-agnostic core.

### Go (Gin)

```go
ad, _ := authdog.New(authdog.Config{PublicKey: os.Getenv("PK_AUTHDOG")})

r := gin.Default()
r.Use(ad.AttachSession())                 // resolves *authdog.Context per request
r.GET("/me", ad.RequireAuth(), func(c *gin.Context) {
    c.JSON(http.StatusOK, authdog.FromGin(c).User)
})
r.GET("/logout", ad.Logout)
```

### Rust (axum)

```rust
let authdog = Authdog::new(&std::env::var("PK_AUTHDOG").unwrap()).unwrap();

let app = Router::new()
    .route("/me", get(me).layer(middleware::from_fn(require_auth)))
    .route("/logout", get(logout))
    .layer(middleware::from_fn_with_state(authdog.clone(), attach_session))
    .with_state(authdog);

async fn me(ctx: AuthContext) -> Json<Value> { Json(ctx.user.unwrap_or(Value::Null)) }
```

The same surface ships as a dedicated crate per framework on top of the shared
`authdog-core`: `authdog-axum`, `authdog-actix` (extractors + middleware),
`authdog-rocket` (request guards + catcher), `authdog-warp` (composable
filters), and `authdog-poem` (extractors + middleware).

### Kotlin (Ktor)

```kotlin
import com.authdog.Authdog

fun Application.module() {
    val authdog = Authdog(System.getenv("PK_AUTHDOG"))

    routing {
        get("/me") {
            val ctx = authdog.requireAuth(call) ?: return@get  // requireAuth is the gate
            call.respondText(ctx.user.toString())
        }
        get("/logout") { authdog.logout(call) }
    }
}
```

### React Native / Expo

Wrap your app with the provider, backed by hardware-secure storage, and handle the login deep link:

```tsx
import * as SecureStore from "expo-secure-store";
import { AuthdogProvider, createSecureStoreAdapter } from "@authdog/react-native";

export default function App() {
  return (
    <AuthdogProvider
      publicKey={process.env.EXPO_PUBLIC_PK_AUTHDOG!}
      storage={createSecureStoreAdapter(SecureStore)}
    >
      <RootNavigator />
    </AuthdogProvider>
  );
}
```

```tsx
import { useSignIn, useRedirectHandler } from "@authdog/react-native";
// signIn("myapp://callback") opens Universal Login; handleRedirect(url)
// validates the returned token and persists it via your secure storage.
```

### Runnable examples

Each framework ships a runnable demo under [`examples/`](examples). Set `PK_AUTHDOG` (or the framework's public-key variable) and start one with moon:

| Example | Package showcased | Run |
| ------- | ----------------- | --- |
| [`examples/nextjs-app`](examples/nextjs-app) | `@authdog/nextjs-app` + `@authdog/react-elements` | `moon run nextjs-app-sample:dev` |
| [`examples/remix`](examples/remix) | `@authdog/remix-node` + `@authdog/react-elements` | `moon run remix-playground:dev` |
| [`examples/vue-app`](examples/vue-app) | `@authdog/vue` (home, login, signup, profile, permissions) | `moon run vue-app:dev` |
| [`examples/astro`](examples/astro) | `@authdog/astro` (SSR middleware, server `getUser`, logout) | `moon run astro-app:dev` |
| [`examples/sveltekit`](examples/sveltekit) | `@authdog/sveltekit` (SSR `handle` hook, server `getUser`, logout) | `moon run sveltekit-app:dev` |
| [`examples/angular`](examples/angular) | `@authdog/angular` (interceptor, guard, signals) | `moon run angular-app:dev` |
| [`examples/express`](examples/express) | `@authdog/express` (attachSession, requireAuth, logout) | `moon run express-api:dev` |
| [`examples/fastify`](examples/fastify) | `@authdog/fastify` (plugin, requireAuth, logout) | `moon run fastify-api:dev` |
| [`examples/react-native`](examples/react-native) | `@authdog/react-native` (Expo, deep-link sign-in, secure store) | `moon run react-native-app:dev` |

## 🛠 Development

This is a [Bun](https://bun.sh) + [moon](https://moonrepo.dev) monorepo.

### Prerequisites

- [Bun](https://bun.sh) `>= 1.2.11`
- [Node.js](https://nodejs.org) `>= 20.17.0`

### Setup

```bash
git clone https://github.com/authdog/web-sdk.git
cd web-sdk
bun install
```

### Common tasks

The repo ships a [`Justfile`](Justfile) for ergonomic shortcuts:

| Command | Description |
| ------- | ----------- |
| `just build` | Build all publishable packages |
| `just dev-next` | Run the Next.js demo app |
| `just dev-remix` | Run the Remix demo app |
| `just ui` | Launch the Storybook component explorer |
| `just ci` | Run the full CI pipeline locally |

Prefer raw scripts? `bun run build`, `bun run dev`, `bun run test`, `bun run lint`, and `bun run check-types` all work via moon.

### Repository layout

```
web-sdk/
├── examples/        # Runnable demo apps (Next.js, Remix, Vue, Astro, SvelteKit, Angular, Express, Fastify, React Native)
├── packages/        # Published SDK packages + shared configs
│   ├── react-elements/   # React UI components
│   ├── nextjs-app/       # Next.js App Router SDK
│   ├── remix/            # Remix SDK (@authdog/remix-node)
│   ├── tanstack-start/   # TanStack Start SDK
│   ├── vue/              # Vue SDK
│   ├── astro/            # Astro SDK
│   ├── sveltekit/        # SvelteKit SDK
│   ├── angular/          # Angular SDK
│   ├── express/          # Express SDK
│   ├── fastify/          # Fastify SDK
│   ├── react-native/     # React Native / Expo SDK
│   ├── node-commons/     # Shared Node utilities
│   ├── python/           # Python SDK (FastAPI, Flask, Django, Starlette, aiohttp) — authdog-fastapi
│   ├── go/               # Go SDK (Gin)
│   ├── rust/             # Rust workspace (axum, actix, rocket, warp, poem) — authdog-core + crates
│   ├── kotlin/           # Kotlin SDK (Ktor) — authdog-ktor
│   ├── eslint/           # Shared ESLint config
│   └── typescript-config/# Shared tsconfig presets
└── .moon/           # moon workspace & toolchain config
```

### Releasing

Versioning and changelogs are handled with [Changesets](https://github.com/changesets/changesets):

```bash
bun run changeset        # describe your change
bun run publish-packages # build + publish to npm
```

## 🤝 Contributing

Contributions are welcome and appreciated! To get started:

1. Fork the repository and create a feature branch.
2. Make your changes and add a changeset (`bun run changeset`).
3. Ensure `bun run ci` passes.
4. Open a pull request describing your change.

Please report bugs and request features via [GitHub Issues](https://github.com/authdog/web-sdk/issues).

## 🔒 Security

Found a vulnerability? Please **do not** open a public issue. See our [Security Policy](SECURITY.md) for responsible disclosure instructions.

## 📄 License

[MIT](LICENSE) © Authdog

<div align="center">
<sub>Built with ❤️ by the Authdog team and contributors.</sub>
</div>
