# Contract: Verification

## Per-integration workflow

Add these files, each copied from the live Fastify/Vue workflow shape (checkout, moon, Bun `1.3.14`, frozen lockfile, one moon test task):

| File | Moon task | Path filter |
| --- | --- | --- |
| `.github/workflows/ci-hono.yml` | `hono:test` | `packages/hono/**` |
| `.github/workflows/ci-koa.yml` | `koa:test` | `packages/koa/**` |
| `.github/workflows/ci-elysia.yml` | `elysia:test` | `packages/elysia/**` |
| `.github/workflows/ci-react-router.yml` | `react-router:test` | `packages/react-router/**` |
| `.github/workflows/ci-nuxt.yml` | `nuxt:test` | `packages/nuxt/**` |
| `.github/workflows/ci-solid.yml` | `solid:test` | `packages/solid/**` |
| `.github/workflows/ci-javascript.yml` | `javascript:test` | `packages/javascript/**` |
| `.github/workflows/ci-tauri.yml` | `tauri:test` | `packages/tauri/**` |

Each workflow also filters on its own file, triggers on `push` and `pull_request` to `main`, and allows `workflow_dispatch`.

A change under only one package directory MUST be enough to select that workflow. Do not add a combined workflow. Do not switch existing workflows onto `_reusable-node.yml` in this wave.

## Example tasks

Register the eight example ids from `data-model.md` in `.moon/workspace.yml`.

Each example `moon.yml` exposes:

- `build` — depends on `<package>:build`
- `type-check` — depends on `<package>:build`
- `dev` — depends on `<package>:build`, preset `server`

## Contributor commands

`Justfile` gains `dev-hono`, `dev-koa`, `dev-elysia`, `dev-react-router`, `dev-nuxt`, `dev-solid`, `dev-javascript`, and `dev-tauri`, each invoking the example `dev` task. Existing `dev-*` recipes stay as they are.

## Release notes

Do not add a changeset unless a publishable package's behavior changes. The existing changesets already cover the eight packages' minor releases. Example packages stay private.
