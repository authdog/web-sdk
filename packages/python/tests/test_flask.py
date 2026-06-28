import base64
import json

import httpx
import respx
from flask import Flask

from authdog.flask import Authdog

IDENTITY_HOST = "https://id.authdog.com"
ENV_ID = "env_123"


def make_pk() -> str:
    payload = {"environmentId": ENV_ID, "identityHost": IDENTITY_HOST}
    return "pk_" + base64.b64encode(json.dumps(payload).encode()).decode()


def build_app() -> Flask:
    app = Flask(__name__)
    authdog = Authdog(public_key=make_pk())

    @app.get("/me")
    @authdog.require_auth
    def me():
        return {"user": authdog.session().user}

    @app.get("/session")
    def session():
        return {"authenticated": authdog.session().is_authenticated}

    @app.get("/logout")
    def logout():
        return authdog.logout()

    return app


def test_invalid_public_key_fails_fast():
    try:
        Authdog(public_key="pk_not-base64")
    except Exception:
        return
    raise AssertionError("expected an exception")


def test_require_auth_401_without_token():
    client = build_app().test_client()
    assert client.get("/me").status_code == 401


@respx.mock
def test_require_auth_succeeds_with_valid_session():
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(
            200, json={"meta": {"code": 200}, "user": {"id": "u1"}}
        )
    )
    client = build_app().test_client()
    resp = client.get("/me", headers={"Authorization": "Bearer good-token"})
    assert resp.status_code == 200
    assert resp.get_json() == {"user": {"id": "u1"}}


@respx.mock
def test_non_success_envelope_is_unauthenticated():
    respx.get(f"{IDENTITY_HOST}/oidc/{ENV_ID}/userinfo").mock(
        return_value=httpx.Response(200, json={"meta": {"code": 401}})
    )
    client = build_app().test_client()
    assert client.get("/me", headers={"Authorization": "Bearer x"}).status_code == 401


def test_logout_clears_cookie_and_redirects():
    client = build_app().test_client()
    resp = client.get("/logout?redirect_uri=/bye")
    assert resp.status_code == 302
    assert resp.headers["Location"] == "/bye"
    assert "authdog-session=" in resp.headers["Set-Cookie"]


def test_logout_sanitizes_open_redirect():
    client = build_app().test_client()
    resp = client.get("/logout?redirect_uri=https://evil.com")
    assert resp.headers["Location"] == "/"
