# Contract: Project catalog

The root `README.md` is the developer-facing catalog. After this wave it MUST still list every integration it lists today, and it MUST add the eight below in the same style.

## Server table

Add rows next to Express and Fastify:

| Package | Directory | Developer-facing description |
| --- | --- | --- |
| `@authdog/hono` | `packages/hono` | Hono session middleware, auth gate, and logout |
| `@authdog/koa` | `packages/koa` | Koa session middleware, auth gate, and logout |
| `@authdog/elysia` | `packages/elysia` | Elysia session plugin, auth gate, and logout |

Each row includes the npm version badge and a CI badge pointing at that package's new workflow, matching the Express and Fastify rows.

## Browser and desktop table

Add rows in the same packages table used for Vue and Astro:

| Package | Directory | Developer-facing description |
| --- | --- | --- |
| `@authdog/react-router` | `packages/react-router` | React Router 7 loader session and logout |
| `@authdog/nuxt` | `packages/nuxt` | Nuxt plugin, composables, and server session helpers |
| `@authdog/solid` | `packages/solid` | SolidJS provider and session primitives |
| `@authdog/javascript` | `packages/javascript` | Framework-free browser client |
| `@authdog/tauri` | `packages/tauri` | Desktop client with system-browser sign-in |

## Examples table and layout

The runnable-examples table and the repository-layout tree MUST gain one entry per sample:

| Sample | Showcases | Start command |
| --- | --- | --- |
| `examples/hono` | `@authdog/hono` | `moon run hono-api:dev` |
| `examples/koa` | `@authdog/koa` | `moon run koa-api:dev` |
| `examples/elysia` | `@authdog/elysia` | `moon run elysia-api:dev` |
| `examples/react-router` | `@authdog/react-router` | `moon run react-router-app:dev` |
| `examples/nuxt` | `@authdog/nuxt` | `moon run nuxt-app:dev` |
| `examples/solid` | `@authdog/solid` | `moon run solid-app:dev` |
| `examples/javascript` | `@authdog/javascript` | `moon run javascript-app:dev` |
| `examples/tauri` | `@authdog/tauri` | `moon run tauri-app:dev` |

The framework list in the overview introduction MUST name these hosts without removing hosts already named.

## Out of catalog scope

Do not add `data-commons`. Do not rewrite the existing React SDK or Chrome extension rows.
