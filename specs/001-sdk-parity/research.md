# Research: New SDK Parity

## Decision: The next wave is parity for eight existing SDKs

**Decision**: Close the gap for `@authdog/hono`, `@authdog/koa`, `@authdog/elysia`, `@authdog/react-router`, `@authdog/nuxt`, `@authdog/solid`, `@authdog/javascript`, and `@authdog/tauri`.

**Rationale**: Those packages landed together on 2026-07-23 (`225b972`) with library code, unit tests, package READMEs, moon tasks, and changesets (`.changeset/new-server-adapters.md`, `.changeset/new-frontend-sdks.md`). They are absent from the root overview, the examples directory, the contributor command list, and the per-integration CI workflows. The previous product wave in this repo was "add the adapter, then give it a sample and a dedicated check" (Express/Fastify samples, `ci-*.yml`, Gatsby/Redwood). Parity is the unfinished half of that wave.

**Alternatives considered**:

- Document the whole monorepo. Rejected: the constitution limits the first spec to the next bounded change, and the already-listed integrations are not the gap.
- Add another new framework. Rejected: eight integrations are already implemented and undiscoverable.
- Include `@authdog/react` and `@authdog/chrome-extension`. Rejected: both are already in the root overview. Chrome extension already has `ci-chrome-extension.yml`.
- Include `packages/data-commons`. Rejected: the directory only contains an empty `migrations/` folder and is not a moon project.

## Decision: Do not change adapter behavior

**Decision**: Samples, catalog entries, commands, and checks only. No new session cookie, userinfo path, or export change.

**Rationale**: Package READMEs already describe the same contract as Express/Fastify (server) and Vue (browser): `createAuthdog` / client factory, public-key configuration, anonymous degradation, protected gate, sign-out. Changesets for the unpublished minor versions already exist.

**Alternatives considered**:

- Rewrite the eight packages onto one shared server helper. Rejected: constitution requires framework-native packages and forbids a new session mechanism.
- Bump versions again for this wave. Rejected: examples are `private`, and docs/CI do not change published behavior. Add a changeset only if implementation has to change a publishable package.

## Decision: Three sample shapes, copied from existing apps

**Decision**:

- Server samples copy `examples/express`: public page, protected page, sign-out, fail-fast on missing `PK_AUTHDOG`.
- Browser-framework samples copy `examples/vue-app`: signed-out, profile, sign-out, public key only.
- JavaScript sample is a small browser page that consumes the redirect callback.
- Tauri sample is a TypeScript harness with an injectable URL opener and callback, not a Rust desktop bundle.

**Rationale**: Express (`PORT` 3010) and Fastify (`PORT` 3011) already define the server journey. Vue already defines the browser journey. `@authdog/tauri` documents injectable `openUrl` and no hard Tauri dependency, so the sample can type-check with the same Bun/TypeScript toolchain as the other examples. `examples/react-native` is the precedent for a non-web host whose package CI does not build the native shell.

**Alternatives considered**:

- One multi-framework demo app. Rejected: every current example showcases one package.
- A full Tauri (`src-tauri`) app in this wave. Rejected: it needs a Rust toolchain and a system webview, which no current example CI requires. Native packaging can be a later slice.
- Call the unused `.github/workflows/_reusable-node.yml`. Rejected: every live workflow inlines the same steps (`ci-fastify.yml`, `ci-vue.yml`). This wave copies that live pattern instead of migrating CI.

## Decision: Checks stay per integration

**Decision**: Add one workflow per package, path-filtered to that package, running `moon run <project>:test`. Register each example in `.moon/workspace.yml` with `build`, `type-check`, and `dev` tasks matching the example it copies. Add a `just dev-*` command per sample.

**Rationale**: That is how Fastify, Vue, and the other listed integrations are checked and launched today. `moon ci` already sees workspace projects; new examples must use the same task names so they do not invent a second pipeline.

**Alternatives considered**:

- A single workflow that tests all eight packages. Rejected: it would break the one-badge-per-integration pattern and would run unrelated packages on every change.
- Skip examples for JavaScript and Tauri and only update the overview. Rejected: the spec requires a runnable sample for all eight.

## Decision: Ports

**Decision**: Server samples use 3012 (Hono), 3013 (Koa), and 3014 (Elysia). Browser samples use 3002 (React Router), 3003 (Nuxt), 3004 (Solid), 3005 (JavaScript), and 3006 (Tauri harness).

**Rationale**: 3010 and 3011 are taken by Express and Fastify. Vue uses 3001. Distinct defaults let a developer run a new sample next to an existing one.

**Alternatives considered**: Shared default port 3000. Rejected: it collides with samples that are already in the repo.
