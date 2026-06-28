import base64
import json

import httpx
import respx
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.testclient import TestClient

from authdog.starlette import Authdog

IDENTITY_HOST = "https://id.authdog.com"
ENV_ID = "env_123"


def make_pk() -> str:
    payload = {"environmentId": ENV_ID, "identityHost": IDENTITY_HOST}
    return "pk_" + base64.b64encode(json.dumps(payload).encode()).decode()


def build_app() -> Starlette:
    authdog = Authdog(public_key=make_pk())

    async def me(request):
        user = await authdog.require_auth(request)
        return JSONResponse({"user": user})

    async def session(request):
        ctx = await authdog.session(request)
        return JSONResponse({"authenticated": ctx.is_authenticated})

    def logout(request):
        return authdog.logout(request)

    return Starlette(
        routes=[
            Route("/me", me),
            Route("/session", session),
            Route("/logout", logout),
        ],
        middleware=[authdog.middleware],
    )


def test_invalid_public_key_fails_fast():
    try:
        Authdog(public_key="pk_not-base64")
    except Exception:
        return
    raise AssertionError("expected an exception")


def test_require_auth_401_without_token():
    client = TestClient(build_app())
    assert client.get("/me").status_code == 401


@respx.mock
def test_require_auth_succeeds_with_valid_session():
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(
            200, json={"meta": {"code": 200}, "user": {"id": "u1"}}
        )
    )
    client = TestClient(build_app())
    resp = client.get("/me", headers={"Authorization": "Bearer good-token"})
    assert resp.status_code == 200
    assert resp.json() == {"user": {"id": "u1"}}


@respx.mock
def test_non_success_envelope_is_unauthenticated():
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(200, json={"meta": {"code": 401}})
    )
    client = TestClient(build_app())
    assert client.get("/me", headers={"Authorization": "Bearer x"}).status_code == 401


def test_logout_clears_cookie_and_redirects():
    client = TestClient(build_app(), follow_redirects=False)
    resp = client.get("/logout?redirect_uri=/bye")
    assert resp.status_code == 302
    assert resp.headers["location"] == "/bye"
    assert "authdog-session=" in resp.headers["set-cookie"]


def test_logout_sanitizes_open_redirect():
    client = TestClient(build_app(), follow_redirects=False)
    resp = client.get("/logout?redirect_uri=https://evil.com")
    assert resp.headers["location"] == "/"
