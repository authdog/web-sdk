import json
from pathlib import Path

import httpx
import pytest
import respx

from authdog.billing import list_billing_plans
from authdog.public_key import PublicKeyError

TRUSTED = "https://identity.authdog.com"
PIN_PATH = (
    Path(__file__).resolve().parents[3]
    / "specs/002-api-parity/contracts/pins/billing-plans-response.json"
)
PIN = json.loads(PIN_PATH.read_text())


@pytest.mark.asyncio
@respx.mock
async def test_list_plans_returns_pinned_shape():
    respx.get(f"{TRUSTED}/billing/env-1/plans?for=user").respond(json=PIN)
    async with httpx.AsyncClient() as client:
        result = await list_billing_plans(TRUSTED, "env-1", client=client)
    assert result["plans"][0]["slug"] == "pro"
    assert result["publishableKey"] == PIN["publishableKey"]


@pytest.mark.asyncio
async def test_untrusted_host_rejects_before_request():
    with pytest.raises(PublicKeyError):
        await list_billing_plans("https://evil.example", "env-1")
