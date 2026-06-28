"""Identity-provider (OIDC ``userinfo``) lookups."""

from __future__ import annotations

from typing import Any
from urllib.parse import quote

import httpx

from .public_key import assert_trusted_identity_host

__all__ = ["fetch_user_data", "is_authenticated_user_info"]


async def fetch_user_data(
    identity_host: str,
    environment_id: str,
    token: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    """Fetch user data from the identity host's OIDC ``userinfo`` endpoint.

    The ``identity_host`` is re-validated against the trusted-host allowlist
    before the bearer token is sent, preventing SSRF / token exfiltration via a
    crafted public key. Callers MUST still check ``meta.code == 200`` (and that
    ``user`` is present) — see :func:`is_authenticated_user_info`.
    """
    safe_host = assert_trusted_identity_host(identity_host)
    url = f"{safe_host}/oidc/{quote(environment_id, safe='')}/userinfo"
    headers = {"authorization": f"Bearer {token}"}

    if client is not None:
        response = await client.get(url, headers=headers)
    else:
        async with httpx.AsyncClient() as owned:
            response = await owned.get(url, headers=headers)

    response.raise_for_status()
    return response.json()


def is_authenticated_user_info(data: dict[str, Any] | None) -> bool:
    """True only when the userinfo envelope represents an authenticated user."""
    if not data:
        return False
    meta = data.get("meta")
    code = meta.get("code") if isinstance(meta, dict) else None
    return code == 200 and bool(data.get("user"))
