<div align="center">

# Authdog Web SDK

**Drop-in authentication and identity for modern web frameworks.**

A curated monorepo of framework-native libraries that make it effortless to add
secure sessions, user management, and auth UI to your React, Next.js, Remix, and
Vue applications.

[![packages-publish](https://github.com/authdog/web-sdk/actions/workflows/packages-publish.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/packages-publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)
[![Built with Bun](https://img.shields.io/badge/built%20with-bun-fbf0df.svg?logo=bun&logoColor=black)](https://bun.sh)

[Quick Start](#-quick-start) · [Packages](#-packages) · [Examples](#-examples) · [Development](#-development) · [Contributing](#-contributing)

</div>

---

## ✨ Why Authdog Web SDK?

- **🧩 Framework-native** — idiomatic packages for React, Next.js (App Router), Remix, and Vue. No glue code.
- **🔐 Secure by default** — token validation, cookie handling, and session lifecycle managed for you.
- **🎨 Batteries-included UI** — ready-made, accessible components (sign-in, user profile, TOTP, navbar) you can drop in or restyle.
- **⚡ Tiny & tree-shakeable** — ESM-first, `sideEffects: false`, dual CJS/ESM builds via [tsup](https://tsup.egoist.dev).
- **🟦 Type-safe end to end** — written in TypeScript with first-class types shipped in every package.
- **🌐 Server & client split** — explicit `/client` and `/server` entry points keep secrets server-side.

## 📦 Packages

| Package | Version | Description |
| ------- | ------- | ----------- |
| [`@authdog/react-elements`](packages/react-elements) | [![npm](https://img.shields.io/npm/v/@authdog/react-elements)](https://www.npmjs.com/package/@authdog/react-elements) | Accessible React UI components — buttons, navbar, user profile & dropdown, TOTP validator. |
| [`@authdog/nextjs-app`](packages/nextjs-app) | [![npm](https://img.shields.io/npm/v/@authdog/nextjs-app)](https://www.npmjs.com/package/@authdog/nextjs-app) | Next.js **App Router** SDK — provider, `useUser` / `useAuth` hooks, server helpers. |
| [`@authdog/remix-node`](packages/remix) | [![npm](https://img.shields.io/npm/v/@authdog/remix-node)](https://www.npmjs.com/package/@authdog/remix-node) | Remix SDK — auth loaders, provider, and cookie-based session helpers. |
| [`@authdog/vue`](packages/vue) | [![npm](https://img.shields.io/npm/v/@authdog/vue)](https://www.npmjs.com/package/@authdog/vue) | Vue SDK — provider component and `useSession` / `useUser` composables. |
| [`@authdog/node-commons`](packages/node-commons) | [![npm](https://img.shields.io/npm/v/@authdog/node-commons)](https://www.npmjs.com/package/@authdog/node-commons) | Shared Node utilities — public-key parsing, cookies, sessions, identity. |

## 🚀 Quick Start

Pick the package for your framework and install it with your favorite package manager:

```bash
# Next.js (App Router)
bun add @authdog/nextjs-app @authdog/react-elements

# Remix
bun add @authdog/remix-node @authdog/react-elements

# Vue
bun add @authdog/vue
```

Set your Authdog public key as an environment variable:

```bash
# Next.js
NEXT_PUBLIC_PK_AUTHDOG=pk_xxxxxxxxxxxxxxxx
```

> Your public key (`pk_…`) is available in the [Authdog dashboard](https://authdog.com). It is safe to expose to the browser.

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

### Remix

```ts
// app/routes/_index.tsx
import { remixAuthLoader } from "@authdog/remix-node";

export const loader = remixAuthLoader;
```

> Runnable demos for each framework live in [`apps/`](apps).

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
├── apps/            # Runnable demo apps (Next.js, Remix, Vue)
├── packages/        # Published SDK packages + shared configs
│   ├── react-elements/   # React UI components
│   ├── nextjs-app/       # Next.js App Router SDK
│   ├── remix/            # Remix SDK (@authdog/remix-node)
│   ├── vue/              # Vue SDK
│   ├── node-commons/     # Shared Node utilities
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
