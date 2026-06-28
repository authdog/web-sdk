"""Starlette bindings for Authdog.

Exposes an :class:`Authdog` instance that validates the public key once at
startup and integrates with Starlette's ASGI request lifecycle:

* ``authdog.middleware`` — a ``Middleware`` entry that resolves and stashes the
  :class:`AuthdogContext` on ``request.state.authdog_context`` (never raises).
* ``authdog.session(request)`` — read the resolved context (resolves lazily if
  the middleware is not installed).
* ``authdog.require_auth(request)`` — the real server-side gate; raises
  ``HTTPException(401)`` for unauthenticated requests and returns the user.
* ``authdog.logout(request)`` — a ``RedirectResponse`` that clears the session
  cookie and redirects to a sanitized ``redirect_uri``.

```python
import os
from starlette.applications import Starlette
from starlette.middleware import Middleware
from authdog.starlette import Authdog

authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])

async def me(request):
    user = await authdog.require_auth(request)
    return JSONResponse(user)

app = Starlette(routes=[...], middleware=[authdog.middleware])
```
"""

from __future__ import annotations

import os
from typing import Any

import httpx
from starlette.exceptions import HTTPException
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse

from ._context import AuthdogContext, resolve_context
from .cookies import SESSION_COOKIE_NAME
from .public_key import PublicKeyPayload, validate_and_parse_public_key
from .redirects import sanitize_redirect_path

__all__ = ["Authdog", "AuthdogContext"]

# Attribute on ``request.state`` caching the resolved context.
_STATE_KEY = "authdog_context"


class Authdog:
    """An Authdog server instance for Starlette.

    The public key is validated and parsed eagerly here — enforcing the trusted
    identity-host allowlist — so a malformed or untrusted key fails fast at
    startup rather than on the first request.
    """

    def __init__(
        self,
        public_key: str,
        *,
        fetch_user: bool = True,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        if not public_key:
            raise ValueError("Public key is not defined")
        self.payload: PublicKeyPayload = validate_and_parse_public_key(public_key)
        self._fetch_user = fetch_user
        self._client = client

    async def _resolve(self, request: Request) -> AuthdogContext:
        cached = getattr(request.state, _STATE_KEY, None)
        if isinstance(cached, AuthdogContext):
            return cached

        ctx = await resolve_context(
            self.payload,
            fetch_user=self._fetch_user,
            client=self._client,
            authorization=request.headers.get("authorization"),
            cookie_header=request.headers.get("cookie"),
        )
        setattr(request.state, _STATE_KEY, ctx)
        return ctx

    @property
    def middleware(self) -> Middleware:
        """A ``Middleware`` entry that attaches ``request.state.authdog_context``."""
        authdog = self

        class _AuthdogMiddleware(BaseHTTPMiddleware):
            async def dispatch(self, request: Request, call_next: Any) -> Any:
                await authdog._resolve(request)
                return await call_next(request)

        return Middleware(_AuthdogMiddleware)

    async def session(self, request: Request) -> AuthdogContext:
        """Return the resolved (possibly anonymous) context for this request."""
        return await self._resolve(request)

    async def require_auth(self, request: Request) -> Any:
        """Gate. Raises ``HTTPException(401)`` unless authenticated.

        ⚠️ This is the real server-side enforcement point. Returns the user
        object.
        """
        ctx = await self._resolve(request)
        if not ctx.is_authenticated:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return ctx.user

    def logout(self, request: Request) -> RedirectResponse:
        """Clear the session cookie and redirect to a safe, same-origin path."""
        redirect_to = sanitize_redirect_path(
            request.query_params.get("redirect_uri"), "/"
        )
        response = RedirectResponse(url=redirect_to, status_code=302)
        response.delete_cookie(
            SESSION_COOKIE_NAME,
            path="/",
            httponly=True,
            samesite="lax",
            secure=os.environ.get("ENV", "").lower() == "production",
        )
        return response

    def get_public_key_payload(self) -> PublicKeyPayload:
        return self.payload
