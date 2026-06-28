"""aiohttp bindings for Authdog.

Exposes an :class:`Authdog` instance that validates the public key once at
startup and integrates with aiohttp's server middleware lifecycle:

* ``authdog.middleware`` — an ``@web.middleware`` that resolves and stashes the
  :class:`AuthdogContext` on ``request["authdog_context"]`` (never raises).
* ``authdog.session(request)`` — read the resolved context (resolves lazily if
  the middleware is not installed).
* ``authdog.require_auth`` — a handler decorator and the real server-side gate;
  raises ``web.HTTPUnauthorized`` for unauthenticated requests.
* ``authdog.logout(request)`` — a ``web.HTTPFound`` redirect that clears the
  session cookie and redirects to a sanitized ``redirect_uri``.

```python
import os
from aiohttp import web
from authdog.aiohttp import Authdog

authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])

@authdog.require_auth
async def me(request):
    return web.json_response((await authdog.session(request)).user)

app = web.Application(middlewares=[authdog.middleware])
app.router.add_get("/me", me)
app.router.add_get("/logout", authdog.logout)
```
"""

from __future__ import annotations

import functools
import os
from typing import Any, Awaitable, Callable

import httpx
from aiohttp import web

from ._context import AuthdogContext, resolve_context
from .cookies import SESSION_COOKIE_NAME
from .public_key import PublicKeyPayload, validate_and_parse_public_key
from .redirects import sanitize_redirect_path

__all__ = ["Authdog", "AuthdogContext"]

# Key on the aiohttp request mapping caching the resolved context.
_REQUEST_KEY = "authdog_context"

_Handler = Callable[[web.Request], Awaitable[web.StreamResponse]]


class Authdog:
    """An Authdog server instance for aiohttp.

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

        # ``web.middleware`` tags the coroutine with an attribute, which fails on
        # a bound method (no ``__dict__``), so wrap a plain closure and bind it
        # once: ``app = web.Application(middlewares=[authdog.middleware])``.
        @web.middleware
        async def _middleware(request: web.Request, handler: _Handler) -> web.StreamResponse:
            await self._resolve(request)
            return await handler(request)

        self.middleware = _middleware

    async def _resolve(self, request: web.Request) -> AuthdogContext:
        cached = request.get(_REQUEST_KEY)
        if isinstance(cached, AuthdogContext):
            return cached

        ctx = await resolve_context(
            self.payload,
            fetch_user=self._fetch_user,
            client=self._client,
            authorization=request.headers.get("authorization"),
            cookie_header=request.headers.get("cookie"),
        )
        request[_REQUEST_KEY] = ctx
        return ctx

    async def session(self, request: web.Request) -> AuthdogContext:
        """Return the resolved (possibly anonymous) context for this request."""
        return await self._resolve(request)

    def require_auth(self, handler: _Handler) -> _Handler:
        """Handler decorator / gate. Raises ``401`` unless authenticated.

        ⚠️ This is the real server-side enforcement point.
        """

        @functools.wraps(handler)
        async def wrapper(request: web.Request) -> web.StreamResponse:
            if not (await self._resolve(request)).is_authenticated:
                raise web.HTTPUnauthorized(
                    text='{"error": "Unauthorized"}',
                    content_type="application/json",
                )
            return await handler(request)

        return wrapper

    async def logout(self, request: web.Request) -> web.StreamResponse:
        """Clear the session cookie and redirect to a safe, same-origin path.

        Raises the ``web.HTTPFound`` redirect (aiohttp's idiom) after clearing
        the cookie, so it can be registered directly as a route handler.
        """
        redirect_to = sanitize_redirect_path(
            request.query.get("redirect_uri"), "/"
        )
        response = web.HTTPFound(redirect_to)
        response.del_cookie(SESSION_COOKIE_NAME, path="/")
        raise response

    def get_public_key_payload(self) -> PublicKeyPayload:
        return self.payload
