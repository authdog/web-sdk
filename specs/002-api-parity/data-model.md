# Data Model: SDK API Parity

## API group

A named slice of the identity (or eval) HTTP surface the SDK exposes.

| Field | Description |
| --- | --- |
| `id` | Stable slug, e.g. `billing`, `account-sessions` |
| `tier` | `P0`, `P1`, `P2`, or `out` |
| `host` | `identity`, `api-eval`, or `management` |
| `auth` | `none`, `user-bearer`, `env-secret`, `pat` |
| `routes` | List of method + path templates |

**Validation**: Every `identity` route MUST map to a platform-next identity app registration or documented OIDC path. `management` groups tier `out` unless Wave 10 exception list adds them.

---

## Language core

| Field | Description |
| --- | --- |
| `id` | Package id, e.g. `node-commons`, `python`, `go` |
| `tier` | `1` (P0 gate) or `2` (follow-on) |
| `module` | Source path for API client code |

**Relationships**: Implements many **parity cells**. Depends on shared allowlist + HTTP helper conventions of that language.

---

## Parity cell

| Field | Description |
| --- | --- |
| `coreId` | Language core id |
| `groupId` | API group id |
| `status` | `yes`, `no`, `na` |
| `wave` | Target wave number when `no` |
| `exception` | Optional path to approved waiver file |

**State transitions**:

- `no` → `yes` when core ships helpers + tests and matrix PR merges.
- `yes` → `no` if pin tests fail until fixtures updated (regression).

---

## Contract pin

| Field | Description |
| --- | --- |
| `id` | e.g. `billing-plans-response` |
| `path` | Relative under `contracts/pins/` |
| `groupId` | API group |
| `description` | What response shape guards |

Used by unit tests; not runtime configuration.

---

## Implementation wave

| Field | Description |
| --- | --- |
| `number` | 1–10 |
| `title` | Short name |
| `deliverables` | Docs + code areas |
| `exitCriteria` | Matrix rows that must flip to `yes` |

Waves are strictly ordered for dependencies (see [contracts/waves.md](./contracts/waves.md)).

---

## Browser client namespace

Logical grouping on `createAuthdogClient`:

| Namespace | API groups |
| --- | --- |
| `billing` | billing |
| `account` | account-sessions, account-devices, account-connected-apps, account-profile-actions |

**Rule**: Namespaces MUST NOT expose methods requiring `pat` or `adenv_`.

---

## UserInfo envelope (unchanged)

Existing session model remains authoritative for authentication:

- `meta.code === 200` and `user` present ⇒ authenticated (see `@authdog/node-commons` identity module).

Account REST calls assume the same bearer token; they do not replace userinfo for `requireAuth` middleware.
