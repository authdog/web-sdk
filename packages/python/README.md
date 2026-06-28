# authdog-fastapi

Authdog SDK for [FastAPI](https://fastapi.tiangolo.com) — a session dependency,
an authentication gate, and a logout handler for Python backends. It mirrors the
TypeScript [`@authdog/express`](../express) / [`@authdog/fastify`](../fastify)
SDKs on the wire (same `authdog-session` cookie, same OIDC `userinfo` flow, same
trusted identity-host allowlist), so a single Authdog environment serves Node and
Python services interchangeably.

## Install

```bash
pip install authdog-fastapi
# or, from the monorepo:  pip install -e packages/python[dev]
```

`fastapi` and `httpx` are the only runtime dependencies (`httpx` is pulled in
automatically).

## Quick start

```python
import os
from fastapi import Depends, FastAPI, Request
from authdog.fastapi import Authdog

app = FastAPI()

# Validated + parsed once at startup — a malformed or untrusted key raises here.
authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])  # pk_…

# Public route — read the (possibly anonymous) session context.
@app.get("/")
async def index(ctx=Depends(authdog.session)):
    return {"authenticated": ctx.is_authenticated}

# Protected route — `require_auth` is the real server-side enforcement point.
@app.get("/me")
async def me(user=Depends(authdog.require_auth)):
    return user

# Clears the session cookie and redirects to a sanitized `redirect_uri`.
@app.get("/logout")
async def logout(request: Request):
    return authdog.logout(request)
```

## How it works

- **`authdog.session`** — a dependency that reads the token from the
  `authdog-session` cookie or an `Authorization: Bearer <token>` header, calls
  the identity provider's `userinfo` endpoint, and returns an `AuthdogContext`:

  ```python
  @dataclass
  class AuthdogContext:
      token: str | None = None
      user: Any | None = None
      is_authenticated: bool = False
      user_info: dict | None = None
  ```

  It **never raises** — a missing, invalid, or unverifiable token simply yields
  `is_authenticated == False`. The result is cached on `request.state`, so
  combining `session` and `require_auth` on one request makes at most one
  outbound `userinfo` call.

- **`authdog.require_auth`** — raises `HTTPException(401, "Unauthorized")` for
  unauthenticated requests and otherwise returns the user object. **This is the
  security boundary.** Every protected route must depend on it.

- **`authdog.logout(request)`** — returns a `RedirectResponse` that expires the
  `authdog-session` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` when
  `ENV=production`) and redirects to the `redirect_uri` query parameter after
  running it through `sanitize_redirect_path` to prevent open redirects.

### Skip the userinfo round-trip

For high-throughput services that validate the token elsewhere:

```python
authdog = Authdog(public_key=os.environ["PK_AUTHDOG"], fetch_user=False)
```

`ctx.token` is populated but `is_authenticated` stays `False` — you own
validation.

## Security

- The public key is validated and parsed **once at startup**; a malformed or
  untrusted key (one whose identity host is not on the allowlist) raises
  immediately rather than per-request.
- The bearer token is only ever sent to a trusted, `https:` identity host —
  enforced by `assert_trusted_identity_host`. Self-hosted identity servers can
  be allowlisted via `AUTHDOG_ALLOWED_IDENTITY_HOSTS` (comma-separated hosts).
- A request is authenticated **only** when the `userinfo` envelope reports
  success (`meta.code == 200` with a `user`).

## Development

```bash
cd packages/python
pip install -e .[dev]
pytest            # or:  moon run python:test
```

## License

MIT
