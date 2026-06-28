"""FastAPI bindings for Authdog.

Exposes an :class:`Authdog` instance that validates the public key once at
startup and yields FastAPI dependencies:

* ``authdog.session`` — resolves the request's :class:`AuthdogContext` (never
  raises; ``is_authenticated`` is ``False`` when there is no valid session).
* ``authdog.require_auth`` — the real server-side gate; raises ``401`` for
  unauthenticated requests and otherwise returns the user object.
* ``authdog.logout(request)`` — a ``RedirectResponse`` that clears the session
  cookie and redirects to a sanitized ``redirect_uri``.

```python
import os
from fastapi import Depends, FastAPI
from authdog.fastapi import Authdog

app = FastAPI()
authdog = Authdog(public_key=os.environ["PK_AUTHDOG"])

@app.get("/me")
async def me(user=Depends(authdog.require_auth)):
    return user

@app.get("/logout")
async def logout(request):
    return authdog.logout(request)
```
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx
from fastapi import HTTPException, Request, status
from fastapi.responses import RedirectResponse

from .cookies import SESSION_COOKIE_NAME, get_session_token
from .identity import fetch_user_data, is_authenticated_user_info
from .public_key import PublicKeyPayload, validate_and_parse_public_key
from .redirects import sanitize_redirect_path

__all__ = ["Authdog", "AuthdogContext"]

# Key under which the resolved context is cached on ``request.state`` so the
# dependency only performs one userinfo round-trip per request even when several
# dependencies (``session`` + ``require_auth``) resolve it.
_STATE_KEY = "_authdog_context"


@dataclass
class AuthdogContext:
    token: str | None = None
    user: Any | None = None
    is_authenticated: bool = False
    user_info: dict[str, Any] | None = None


class Authdog:
    """An Authdog server instance for FastAPI.

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

        token = get_session_token(
            request.headers.get("authorization"),
            request.headers.get("cookie"),
        )

        ctx = AuthdogContext()
        if not token:
            setattr(request.state, _STATE_KEY, ctx)
            return ctx

        # Without a userinfo round-trip we cannot vouch for the token, so we
        # surface it but leave ``is_authenticated`` False.
        if not self._fetch_user:
            ctx = AuthdogContext(token=token)
            setattr(request.state, _STATE_KEY, ctx)
            return ctx

        try:
            user_info = await fetch_user_data(
                self.payload.identity_host,
                self.payload.environment_id,
                token,
                client=self._client,
            )
            authenticated = is_authenticated_user_info(user_info)
            ctx = AuthdogContext(
                token=token,
                user=user_info.get("user") if authenticated else None,
                is_authenticated=authenticated,
                user_info=user_info,
            )
        except Exception:
            # A failed or untrusted userinfo lookup is "not authenticated" —
            # never a 500 and never an authenticated session.
            ctx = AuthdogContext(token=token)

        setattr(request.state, _STATE_KEY, ctx)
        return ctx

    async def session(self, request: Request) -> AuthdogContext:
        """FastAPI dependency: the resolved (possibly anonymous) context."""
        return await self._resolve(request)

    async def require_auth(self, request: Request) -> Any:
        """FastAPI dependency / gate. Raises ``401`` unless authenticated.

        ⚠️ This is the real server-side enforcement point. Returns the user
        object so handlers can ``Depends(authdog.require_auth)`` directly.
        """
        ctx = await self._resolve(request)
        if not ctx.is_authenticated:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized",
            )
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
