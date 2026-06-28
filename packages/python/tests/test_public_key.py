import base64
import json

import pytest

from authdog import PublicKeyError, validate_and_parse_public_key
from authdog.public_key import assert_trusted_identity_host


def make_pk(payload: dict) -> str:
    encoded = base64.b64encode(json.dumps(payload).encode()).decode()
    return f"pk_{encoded}"


def test_parses_a_valid_public_key():
    pk = make_pk(
        {"environmentId": "env_123", "identityHost": "https://id.authdog.com"}
    )
    payload = validate_and_parse_public_key(pk)
    assert payload.environment_id == "env_123"
    assert payload.identity_host == "https://id.authdog.com"


def test_strips_trailing_slash_from_identity_host():
    pk = make_pk(
        {"environmentId": "env_123", "identityHost": "https://id.authdog.com/"}
    )
    assert validate_and_parse_public_key(pk).identity_host == "https://id.authdog.com"


@pytest.mark.parametrize("value", ["", "sk_abc", "nope"])
def test_rejects_non_pk_prefixed_keys(value):
    with pytest.raises(PublicKeyError):
        validate_and_parse_public_key(value)


def test_rejects_missing_environment_id():
    pk = make_pk({"identityHost": "https://id.authdog.com"})
    with pytest.raises(PublicKeyError):
        validate_and_parse_public_key(pk)


@pytest.mark.parametrize(
    "host",
    [
        "http://id.authdog.com",  # not https
        "https://id.evil.com",  # not on allowlist
        "https://localhost",  # loopback
        "https://127.0.0.1",  # loopback ip
        "https://169.254.169.254",  # cloud metadata (link-local)
        "https://10.0.0.5",  # private
        "https://attacker-authdog.com.evil.com",  # suffix-trick
    ],
)
def test_rejects_untrusted_identity_hosts(host):
    with pytest.raises(PublicKeyError):
        assert_trusted_identity_host(host)


def test_accepts_allowlisted_hosts():
    assert assert_trusted_identity_host("https://id.authdog.xyz") == "https://id.authdog.xyz"
    assert assert_trusted_identity_host("https://authdog.com") == "https://authdog.com"


def test_extra_allowed_host_via_env(monkeypatch):
    monkeypatch.setenv("AUTHDOG_ALLOWED_IDENTITY_HOSTS", "id.self-hosted.test")
    assert (
        assert_trusted_identity_host("https://id.self-hosted.test")
        == "https://id.self-hosted.test"
    )
