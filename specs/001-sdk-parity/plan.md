# Implementation Plan: New SDK Parity

**Branch**: `001-sdk-parity` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-sdk-parity/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Eight SDKs added on 2026-07-23 (Hono, Koa, Elysia, React Router, Nuxt, Solid, JavaScript, and Tauri) have library code and tests but are missing from the overview, the sample apps, the contributor command list, and per-integration CI. This wave copies the Express/Fastify and Vue surfaces onto those eight packages. It does not change the session protocol or the already-listed integrations.

## Technical Context

**Language/Version**: TypeScript 5.9 on Bun `>= 1.2.15` (repo engine `bun@1.3.1`; CI Bun `1.3.14`). Node `>= 20.17.0`.

**Primary Dependencies**: Existing packages `@authdog/hono`, `@authdog/koa`, `@authdog/elysia`, `@authdog/react-router`, `@authdog/nuxt`, `@authdog/solid`, `@authdog/javascript`, `@authdog/tauri`, each already depending on `@authdog/node-commons`. Host peers already declared by those packages (Hono 4, Koa, Elysia, React Router 7, Nuxt, Solid, none for JavaScript, injectable opener for Tauri).

**Storage**: N/A. Samples keep session state the way the package already does (cookie for servers, the package's client store for browser and desktop).

**Testing**: Vitest via existing `moon run <id>:test`. New samples expose `type-check` the way `examples/express` and `examples/vue-app` do. No new test runner.

**Target Platform**: Linux CI for package tests. Local Bun processes for samples. Tauri sample is a TypeScript harness, not a native desktop bundle.

**Project Type**: Monorepo of framework-native libraries plus private examples.

**Performance Goals**: N/A. This wave does not change request handling.

**Constraints**: Preserve `authdog-session`, the userinfo flow, and the identity-host allowlist. Public key only in browser and desktop samples. Missing `PK_AUTHDOG` fails startup. No new publishable API. Examples stay private. Do not edit already-listed integrations except to add neighboring catalog rows.

**Scale/Scope**: 8 catalog rows, 8 private examples, 8 workflow files, 8 `just` recipes, 8 moon example projects. Package source stays untouched unless a sample cannot be wired without a defect fix.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Result |
| --- | --- | --- |
| I. Framework-Native Packages | One sample per existing package. Shared protocol code stays in `@authdog/node-commons`. | Pass |
| II. Shared Session Protocol | Samples call the existing factories and middleware. No new cookie, token transport, or allowlist. | Pass |
| III. Client/Server Boundary | Server samples keep session resolution on the server. Browser and desktop samples take `PK_AUTHDOG` only. | Pass |
| IV. Published API Compatibility | No export or wire change. Existing changesets remain the release notes. New changeset only if a publishable defect fix is required. | Pass |
| V. Verified, Scoped Changes | Each package keeps its current tests and gains a path-filtered workflow. New samples type-check. Unrelated packages are not rewritten. | Pass |

Post-design re-check: Pass. The Tauri harness avoids a Rust bundle, which keeps the wave inside the existing Bun toolchain instead of adding a native build requirement the constitution does not ask for.

## Project Structure

### Documentation (this feature)

```text
specs/001-sdk-parity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── catalog.md
│   ├── samples.md
│   └── verification.md
├── checklists/
│   └── requirements.md
└── tasks.md              # created later by /speckit-tasks
```

### Source Code (repository root)

```text
README.md                          # catalog rows, example table, layout tree
Justfile                           # eight dev-* recipes
.moon/workspace.yml                # eight example project ids
.github/workflows/ci-{hono,koa,elysia,react-router,nuxt,solid,javascript,tauri}.yml

examples/hono/                     # express-shaped server, port 3012
examples/koa/                      # port 3013
examples/elysia/                   # port 3014
examples/react-router/             # vue-shaped browser journey, port 3002
examples/nuxt/                     # port 3003
examples/solid/                    # port 3004
examples/javascript/               # vanilla redirect client, port 3005
examples/tauri/                    # injectable callback harness, port 3006

packages/{hono,koa,elysia,react-router,nuxt,solid,javascript,tauri}/
                                   # read-only unless a sample-blocking defect appears
```

**Structure Decision**: Extend the current monorepo layout. Server examples follow `examples/express`. Browser examples follow `examples/vue-app`. Workflows follow `.github/workflows/ci-fastify.yml`. No new top-level project type.

## Complexity Tracking

No constitution violations.

The wave touches eight packages because they share one gap from a single commit and the spec splits them into independently demonstrable stories (server, browser framework, vanilla/desktop, checks). A single combined demo was rejected in research.
