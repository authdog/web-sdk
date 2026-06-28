"""Shared session-resolution logic used by every framework binding.

The :class:`AuthdogContext` shape and the userinfo round-trip are identical
across FastAPI, Flask, Django, Starlette, and aiohttp — only the request/response
plumbing differs. Keeping the resolver here means the security invariants (a
failed or untrusted userinfo lookup is *anonymous*, never an error) live in one
place. Per-request caching is left to each framework, since where to stash it
(``request.state``, ``flask.g``, ``request[...]``) is framework-specific.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

from .cookies import get_session_token
from .identity import fetch_user_data, is_authenticated_user_info
from .public_key import PublicKeyPayload

__all__ = ["AuthdogContext", "resolve_context"]


@dataclass
class AuthdogContext:
    token: str | None = None
    user: Any | None = None
    is_authenticated: bool = False
    user_info: dict[str, Any] | None = None


async def resolve_context(
    payload: PublicKeyPayload,
    *,
    fetch_user: bool,
    client: httpx.AsyncClient | None,
    authorization: str | None,
    cookie_header: str | None,
) -> AuthdogContext:
    """Resolve the (possibly anonymous) context for one request.

    Never raises: a missing token, a disabled ``fetch_user``, or a failed /
    untrusted userinfo lookup all yield a context with ``is_authenticated``
    ``False`` rather than an exception.
    """
    token = get_session_token(authorization, cookie_header)
    if not token:
        return AuthdogContext()

    # Without a userinfo round-trip we cannot vouch for the token, so we surface
    # it but leave ``is_authenticated`` False.
    if not fetch_user:
        return AuthdogContext(token=token)

    try:
        user_info = await fetch_user_data(
            payload.identity_host,
            payload.environment_id,
            token,
            client=client,
        )
        authenticated = is_authenticated_user_info(user_info)
        return AuthdogContext(
            token=token,
            user=user_info.get("user") if authenticated else None,
            is_authenticated=authenticated,
            user_info=user_info,
        )
    except Exception:
        # A failed or untrusted userinfo lookup is "not authenticated" — never a
        # 500 and never an authenticated session.
        return AuthdogContext(token=token)
