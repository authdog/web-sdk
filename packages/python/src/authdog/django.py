"""Django bindings for Authdog.

Exposes an :class:`Authdog` instance that validates the public key once at
startup and integrates with Django's middleware + view lifecycle:

* ``authdog.middleware`` — a middleware factory that attaches the resolved
  :class:`AuthdogContext` to ``request.authdog_context`` (never raises).
* ``authdog.require_auth`` — a view decorator and the real server-side gate;
  returns ``JsonResponse({"error": "Unauthorized"}, status=401)`` otherwise.
* ``authdog.session(request)`` — read the resolved context for a request.
* ``authdog.logout(request)`` — an ``HttpResponseRedirect`` that clears the
  session cookie and redirects to a sanitized ``redirect_uri``.

```python
# settings.py
MIDDLEWARE = [..., "myapp.auth.authdog.middleware"]

# myapp/auth.py
import os
from authdog.django import Authdog
authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])

# views.py
from myapp.auth import authdog

@authdog.require_auth
def me(request):
    return JsonResponse(authdog.session(request).user)

def logout(request):
    return authdog.logout(request)
```

Django is imported lazily so ``import authdog.django`` works without Django
installed/configured; the framework is only touched when a binding is used.
"""

from __future__ import annotations

import asyncio
import functools
import os
from typing import Any, Callable

import httpx

from ._context import AuthdogContext, resolve_context
from .cookies import SESSION_COOKIE_NAME
from .public_key import PublicKeyPayload, validate_and_parse_public_key
from .redirects import sanitize_redirect_path

__all__ = ["Authdog", "AuthdogContext"]

# Attribute on the Django request caching the resolved context.
_REQUEST_ATTR = "authdog_context"


class Authdog:
    """An Authdog server instance for Django.

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

    def _resolve(self, request: Any) -> AuthdogContext:
        cached = getattr(request, _REQUEST_ATTR, None)
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
        setattr(request, _REQUEST_ATTR, ctx)
        return ctx

    def session(self, request: Any) -> AuthdogContext:
        """Return the resolved (possibly anonymous) context for ``request``."""
        return self._resolve(request)

    def middleware(self, get_response: Callable[[Any], Any]) -> Callable[[Any], Any]:
        """Django middleware: resolve and attach ``request.authdog_context``.

        Register with ``MIDDLEWARE = [..., "myapp.auth.authdog.middleware"]``.
        """

        def _middleware(request: Any) -> Any:
            self._resolve(request)
            return get_response(request)

        return _middleware

    def require_auth(self, view: Callable[..., Any]) -> Callable[..., Any]:
        """View decorator / gate. Returns ``401`` unless authenticated.

        ⚠️ This is the real server-side enforcement point.
        """
        from django.http import JsonResponse

        @functools.wraps(view)
        def wrapper(request: Any, *args: Any, **kwargs: Any) -> Any:
            if not self._resolve(request).is_authenticated:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            return view(request, *args, **kwargs)

        return wrapper

    def logout(self, request: Any) -> Any:
        """Clear the session cookie and redirect to a safe, same-origin path."""
        from django.http import HttpResponseRedirect

        redirect_to = sanitize_redirect_path(request.GET.get("redirect_uri"), "/")
        response = HttpResponseRedirect(redirect_to)
        response.delete_cookie(SESSION_COOKIE_NAME, path="/", samesite="Lax")
        return response

    def get_public_key_payload(self) -> PublicKeyPayload:
        return self.payload
