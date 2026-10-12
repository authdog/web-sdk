"""Identity-host billing API (plans and subscriptions)."""

from __future__ import annotations

import json
from typing import Any, Literal
from urllib.parse import quote

import httpx

from .public_key import assert_trusted_identity_host

__all__ = [
    "list_billing_plans",
    "get_billing_subscription",
    "create_billing_subscription",
    "cancel_billing_subscription",
]


async def _json_request(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    json_body: dict[str, Any] | None = None,
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    kwargs: dict[str, Any] = {"headers": headers or {}}
    if json_body is not None:
        kwargs["json"] = json_body

    if client is not None:
        response = await client.request(method, url, **kwargs)
    else:
        async with httpx.AsyncClient() as owned:
            response = await owned.request(method, url, **kwargs)

    try:
        body = response.json()
    except json.JSONDecodeError:
        body = {}

    if response.status_code >= 400:
        meta = body.get("meta") if isinstance(body, dict) else None
        message = (
            meta.get("message")
            if isinstance(meta, dict) and meta.get("message")
            else f"Request failed (status {response.status_code})"
        )
        raise httpx.HTTPStatusError(message, request=response.request, response=response)

    return body  # type: ignore[return-value]


async def list_billing_plans(
    identity_host: str,
    environment_id: str,
    *,
    for_resource: Literal["user", "org"] = "user",
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    """List publicly-visible plans for an environment. No auth required."""
    safe_host = assert_trusted_identity_host(identity_host)
    for_param = "org" if for_resource == "org" else "user"
    env = quote(environment_id, safe="")
    url = f"{safe_host}/billing/{env}/plans?for={for_param}"
    return await _json_request("GET", url, client=client)


async def get_billing_subscription(
    identity_host: str,
    environment_id: str,
    token: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    safe_host = assert_trusted_identity_host(identity_host)
    env = quote(environment_id, safe="")
    url = f"{safe_host}/billing/{env}/subscription"
    return await _json_request(
        "GET",
        url,
        headers={"authorization": f"Bearer {token}"},
        client=client,
    )


async def create_billing_subscription(
    identity_host: str,
    environment_id: str,
    token: str,
    *,
    plan_id: str,
    plan_period: Literal["month", "annual"] = "month",
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    safe_host = assert_trusted_identity_host(identity_host)
    env = quote(environment_id, safe="")
    url = f"{safe_host}/billing/{env}/subscriptions"
    return await _json_request(
        "POST",
        url,
        headers={
            "authorization": f"Bearer {token}",
            "content-type": "application/json",
        },
        json_body={"planId": plan_id, "planPeriod": plan_period},
        client=client,
    )


async def cancel_billing_subscription(
    identity_host: str,
    environment_id: str,
    token: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any]:
    safe_host = assert_trusted_identity_host(identity_host)
    env = quote(environment_id, safe="")
    url = f"{safe_host}/billing/{env}/subscriptions/cancel"
    return await _json_request(
        "POST",
        url,
        headers={"authorization": f"Bearer {token}"},
        client=client,
    )
