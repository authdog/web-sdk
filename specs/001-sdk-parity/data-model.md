# Data Model: New SDK Parity

No new persisted data. The model is the catalog record each integration must gain.

## Integration parity record

| Field | Required | Rule |
| --- | --- | --- |
| Package | yes | One of the eight existing packages. Not created by this wave. |
| Audience | yes | `server`, `browser-framework`, `browser-vanilla`, or `desktop` |
| Overview entry | yes | Name, one-line purpose, and sample pointer in the root overview |
| Sample | yes | One private example app under `examples/` |
| Start command | yes | One `just dev-*` command |
| Moon project | yes | Example registered in `.moon/workspace.yml` |
| Automatic check | yes | Path-filtered workflow running that package's existing `test` task |
| Public behavior change | no | Must stay empty unless a sample-blocking defect is fixed |

### Records

| Package | Audience | Moon package id | Example project id | Default port |
| --- | --- | --- | --- | --- |
| `@authdog/hono` | server | `hono` | `hono-api` | 3012 |
| `@authdog/koa` | server | `koa` | `koa-api` | 3013 |
| `@authdog/elysia` | server | `elysia` | `elysia-api` | 3014 |
| `@authdog/react-router` | browser-framework | `react-router` | `react-router-app` | 3002 |
| `@authdog/nuxt` | browser-framework | `nuxt` | `nuxt-app` | 3003 |
| `@authdog/solid` | browser-framework | `solid` | `solid-app` | 3004 |
| `@authdog/javascript` | browser-vanilla | `javascript` | `javascript-app` | 3005 |
| `@authdog/tauri` | desktop | `tauri` | `tauri-app` | 3006 |

## Sample

A sample belongs to exactly one integration.

| Field | Rule |
| --- | --- |
| Visibility | `private: true`. Not published. |
| Dependency | `workspace:*` on its own package only |
| Configuration | `PK_AUTHDOG` in `.env.example`. Missing key fails before serving |
| Server journey | Public page reports signed-out or signed-in. Protected page refuses anonymous visitors. Sign-out returns to a safe in-app path |
| Browser journey | Signed-out shows sign-in. Signed-in shows that person's profile. Sign-out clears it. Public key only |
| Desktop harness | Injectable opener and callback. No `src-tauri` bundle in this wave |
| Tasks | `build`, `type-check`, and `dev`, depending on the matching package's `build` |

## Verification check

| Field | Rule |
| --- | --- |
| Trigger | Push, pull request, and manual dispatch |
| Path filter | `packages/<dir>/**` and the workflow file |
| Command | `moon run <package-id>:test` |
| Isolation | A change to one package does not require editing the other seven |

## Relationships

- One integration has one catalog entry, one sample, one start command, and one automatic check.
- Existing catalog entries (Express, Fastify, Vue, React, Chrome extension, and the other listed SDKs) are read-only during this wave.
- `packages/data-commons` has no parity record.

## State

An integration is **out of parity** until all four of overview entry, sample, start command, and automatic check exist. It is **in parity** when all four exist and the sample demonstrates the journey for its audience. There is no further state in this wave.
