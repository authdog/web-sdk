"""Flask bindings for Authdog.

Exposes an :class:`Authdog` instance that validates the public key once at
startup and integrates with Flask's synchronous request lifecycle:

* ``authdog.session()`` — resolves (and per-request caches on ``flask.g``) the
  :class:`AuthdogContext`; never raises.
* ``authdog.require_auth`` — a view decorator and the real server-side gate;
  returns ``401 {"error": "Unauthorized"}`` for unauthenticated requests.
* ``authdog.logout()`` — a redirect ``Response`` that clears the session cookie
  and redirects to a sanitized ``redirect_uri``.

```python
import os
from flask import Flask
from authdog.flask import Authdog

app = Flask(__name__)
authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])

@app.get("/me")
@authdog.require_auth
def me():
    return authdog.session().user

@app.get("/logout")
def logout():
    return authdog.logout()
```

Flask views are synchronous while the userinfo lookup is async, so the resolver
is driven on a private event loop via :func:`asyncio.run`.
"""

from __future__ import annotations

import asyncio
import functools
import os
from typing import Any, Callable

import httpx
from flask import Response, g, jsonify, redirect, request

from ._context import AuthdogContext, resolve_context
from .cookies import SESSION_COOKIE_NAME
from .public_key import PublicKeyPayload, validate_and_parse_public_key
from .redirects import sanitize_redirect_path

__all__ = ["Authdog", "AuthdogContext"]

# Attribute on ``flask.g`` caching the resolved context so several calls within
# one request perform a single userinfo round-trip.
_G_KEY = "_authdog_context"


class Authdog:
    """An Authdog server instance for Flask.

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

    def _resolve(self) -> AuthdogContext:
        cached = g.get(_G_KEY, None)
        if isinstance(cached, AuthdogContext):
            return cached

        ctx = asyncio.run(
            resolve_context(
                self.payload,
                fetch_user=self._fetch_user,
                client=self._client,
                authorization=request.headers.get("authorization"),
                cookie_header=request.headers.get("cookie"),
            )
        )
        setattr(g, _G_KEY, ctx)
        return ctx

    def session(self) -> AuthdogContext:
        """Return the resolved (possibly anonymous) context for this request."""
        return self._resolve()

    def require_auth(self, view: Callable[..., Any]) -> Callable[..., Any]:
        """View decorator / gate. Returns ``401`` unless authenticated.

        ⚠️ This is the real server-side enforcement point.
        """

        @functools.wraps(view)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            if not self._resolve().is_authenticated:
                return jsonify({"error": "Unauthorized"}), 401
            return view(*args, **kwargs)

        return wrapper

    def logout(self) -> Response:
        """Clear the session cookie and redirect to a safe, same-origin path."""
        redirect_to = sanitize_redirect_path(request.args.get("redirect_uri"), "/")
        response: Response = redirect(redirect_to, code=302)
        response.delete_cookie(
            SESSION_COOKIE_NAME,
            path="/",
            httponly=True,
            samesite="Lax",
            secure=os.environ.get("ENV", "").lower() == "production",
        )
        return response

    def get_public_key_payload(self) -> PublicKeyPayload:
        return self.payload
