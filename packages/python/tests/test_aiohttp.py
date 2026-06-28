import base64
import json

import httpx
import respx
from aiohttp import web

from authdog.aiohttp import Authdog

IDENTITY_HOST = "https://id.authdog.com"
ENV_ID = "env_123"


def make_pk() -> str:
    payload = {"environmentId": ENV_ID, "identityHost": IDENTITY_HOST}
    return "pk_" + base64.b64encode(json.dumps(payload).encode()).decode()


def build_app() -> web.Application:
    authdog = Authdog(public_key=make_pk())

    @authdog.require_auth
    async def me(request):
        ctx = await authdog.session(request)
        return web.json_response({"user": ctx.user})

    async def session(request):
        ctx = await authdog.session(request)
        return web.json_response({"authenticated": ctx.is_authenticated})

    app = web.Application(middlewares=[authdog.middleware])
    app.router.add_get("/me", me)
    app.router.add_get("/session", session)
    app.router.add_get("/logout", authdog.logout)
    return app


def test_invalid_public_key_fails_fast():
    try:
        Authdog(public_key="pk_not-base64")
    except Exception:
        return
    raise AssertionError("expected an exception")


async def test_require_auth_401_without_token(aiohttp_client):
    client = await aiohttp_client(build_app())
    resp = await client.get("/me")
    assert resp.status == 401


@respx.mock
async def test_require_auth_succeeds_with_valid_session(aiohttp_client):
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(
            200, json={"meta": {"code": 200}, "user": {"id": "u1"}}
        )
    )
    client = await aiohttp_client(build_app())
    resp = await client.get("/me", headers={"Authorization": "Bearer good-token"})
    assert resp.status == 200
    assert await resp.json() == {"user": {"id": "u1"}}


@respx.mock
async def test_non_success_envelope_is_unauthenticated(aiohttp_client):
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(200, json={"meta": {"code": 401}})
    )
    client = await aiohttp_client(build_app())
    resp = await client.get("/me", headers={"Authorization": "Bearer x"})
    assert resp.status == 401


async def test_logout_clears_cookie_and_redirects(aiohttp_client):
    client = await aiohttp_client(build_app())
    resp = await client.get(
        "/logout?redirect_uri=/bye", allow_redirects=False
    )
    assert resp.status == 302
    assert resp.headers["Location"] == "/bye"
    assert "authdog-session=" in resp.headers["Set-Cookie"]


async def test_logout_sanitizes_open_redirect(aiohttp_client):
    client = await aiohttp_client(build_app())
    resp = await client.get(
        "/logout?redirect_uri=https://evil.com", allow_redirects=False
    )
    assert resp.headers["Location"] == "/"
