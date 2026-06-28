import base64
import json

import django
import httpx
import respx
from django.conf import settings

if not settings.configured:
    settings.configure(
        DEBUG=True,
        ALLOWED_HOSTS=["*"],
        DATABASES={},
        INSTALLED_APPS=[],
        SECRET_KEY="test-only",
    )
    django.setup()

from django.test import RequestFactory  # noqa: E402

from authdog.django import Authdog  # noqa: E402

IDENTITY_HOST = "https://id.authdog.com"
ENV_ID = "env_123"


def make_pk() -> str:
    payload = {"environmentId": ENV_ID, "identityHost": IDENTITY_HOST}
    return "pk_" + base64.b64encode(json.dumps(payload).encode()).decode()


def build():
    authdog = Authdog(public_key=make_pk())

    @authdog.require_auth
    def me(request):
        from django.http import JsonResponse

        return JsonResponse({"user": authdog.session(request).user})

    return authdog, me, RequestFactory()


def test_invalid_public_key_fails_fast():
    try:
        Authdog(public_key="pk_not-base64")
    except Exception:
        return
    raise AssertionError("expected an exception")


def test_require_auth_401_without_token():
    _, me, rf = build()
    assert me(rf.get("/me")).status_code == 401


@respx.mock
def test_require_auth_succeeds_with_valid_session():
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(
            200, json={"meta": {"code": 200}, "user": {"id": "u1"}}
        )
    )
    _, me, rf = build()
    resp = me(rf.get("/me", HTTP_AUTHORIZATION="Bearer good-token"))
    assert resp.status_code == 200
    assert json.loads(resp.content) == {"user": {"id": "u1"}}


@respx.mock
def test_non_success_envelope_is_unauthenticated():
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(200, json={"meta": {"code": 401}})
    )
    _, me, rf = build()
    assert me(rf.get("/me", HTTP_AUTHORIZATION="Bearer x")).status_code == 401


def test_logout_clears_cookie_and_redirects():
    authdog, _, rf = build()
    resp = authdog.logout(rf.get("/logout", {"redirect_uri": "/bye"}))
    assert resp.status_code == 302
    assert resp["Location"] == "/bye"
    assert "authdog-session" in resp.cookies


def test_logout_sanitizes_open_redirect():
    authdog, _, rf = build()
    resp = authdog.logout(rf.get("/logout", {"redirect_uri": "https://evil.com"}))
    assert resp["Location"] == "/"


def test_middleware_attaches_context():
    authdog = Authdog(public_key=make_pk())
    captured = {}

    def get_response(request):
        captured["ctx"] = request.authdog_context
        return "ok"

    mw = authdog.middleware(get_response)
    assert mw(RequestFactory().get("/")) == "ok"
    assert captured["ctx"].is_authenticated is False
