# Management API vs SDK Boundary

**Management API** (platform-next `services/api`): OpenAPI at `GET /v1/openapi`, title “Authdog API”. Authenticated primarily with **tenant/service PAT**, not end-user session JWT from `pk_…`.

## In scope for web-sdk (app integration)

| Surface | Package | Wave |
| --- | --- | --- |
| Identity host REST/OIDC | Language cores, `@authdog/javascript` | 1–6 |
| AuthZEN evaluation | Server helper in cores | 7 |
| Feature-flag evaluate | Server helper (`adenv_`) | 7 |

## Out of scope for framework adapters

Examples (non-exhaustive; see OpenAPI for full list):

- Tenants, projects, environments CRUD
- OIDC client registration, API secrets, webhooks admin
- RBAC policy admin, threat/security posture admin
- Billing plan CRUD on `/v1/tenants/…/billing/plans` (admin)
- SCIM, HRIS, vault write, FGA admin, pipes admin
- `POST /v1/graphql` management GraphQL

**Consumers**: Authdog CLI, Terraform provider, console, MCP tools.

## Wave 10 options

| Option | Description |
| --- | --- |
| **A (default)** | No `@authdog/management` package; document CLI OpenAPI client generation |
| **B** | New package `@authdog/management`: PAT-only, Node-first, pinned subset of operations |

Framework packages (`@authdog/express`, `@authdog/vue`, …) MUST NOT re-export management clients.

## Exception: sdk-config

`GET /v1/tenants/{tenantId}/environments/{environmentId}/sdk-config` is pinned in platform-next for CLI init (`environmentSdkConfigGet`). If apps need it, expose via **management package or CLI**, not browser SDK.

## Cross-repo drift

When platform-next adds identity routes, update [identity-api-inventory.md](./identity-api-inventory.md) and pins. When management OpenAPI changes, update boundary doc only; no requirement to codegen entire surface into web-sdk.
