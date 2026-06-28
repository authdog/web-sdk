"""Public-key decoding and trusted identity-host validation.

This is the single source of truth for parsing Authdog public keys (``pk_…``)
in Python — it mirrors ``@authdog/node-commons`` so every framework SDK shares
the same base64/JSON decoding and the same SSRF / token-exfiltration guard.
"""

from __future__ import annotations

import base64
import binascii
import ipaddress
import json
import os
import re
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlsplit

__all__ = [
    "PublicKeyPayload",
    "PublicKeyError",
    "assert_trusted_identity_host",
    "validate_and_parse_public_key",
]


class PublicKeyError(ValueError):
    """Raised when a public key (or its identity host) is invalid or untrusted."""


@dataclass(frozen=True)
class PublicKeyPayload:
    environment_id: str
    identity_host: str
    version: str | None = None
    region: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)


# Hosts the SDK is allowed to send the bearer token to. The identity host is
# decoded from the (potentially attacker-influenced) public key, so it MUST be
# validated against an allowlist before it is ever used as a request target —
# otherwise a crafted ``pk_`` could point the SDK (and the token) at an internal
# address (SSRF) or an attacker-controlled server (token exfiltration).
DEFAULT_ALLOWED_HOST_SUFFIXES = ("authdog.com", "authdog.xyz")


def _is_private_or_loopback_host(hostname: str) -> bool:
    h = hostname.lower().strip("[]")
    if h == "localhost" or h.endswith(".localhost"):
        return True
    try:
        ip = ipaddress.ip_address(h)
    except ValueError:
        return False
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_unspecified
    )


def _allowed_host_suffixes() -> list[str]:
    extra = [
        s.strip().lower()
        for s in os.environ.get("AUTHDOG_ALLOWED_IDENTITY_HOSTS", "").split(",")
        if s.strip()
    ]
    return [*DEFAULT_ALLOWED_HOST_SUFFIXES, *extra]


def assert_trusted_identity_host(identity_host: str) -> str:
    """Validate that ``identity_host`` is safe to send credentials to.

    It must be a well-formed ``https:`` URL whose hostname matches the allowlist
    and is not a private/loopback address. Returns the host with any trailing
    slashes stripped; raises :class:`PublicKeyError` otherwise.
    """
    parts = urlsplit(identity_host)
    if parts.scheme != "https" or not parts.hostname:
        if parts.scheme and parts.scheme != "https":
            raise PublicKeyError("Identity host must use https")
        raise PublicKeyError("Invalid identity host")

    hostname = parts.hostname.lower()

    if _is_private_or_loopback_host(hostname):
        raise PublicKeyError("Untrusted identity host")

    allowed = any(
        hostname == suffix or hostname.endswith(f".{suffix}")
        for suffix in _allowed_host_suffixes()
    )
    if not allowed:
        raise PublicKeyError("Untrusted identity host")

    return identity_host.rstrip("/")


def validate_and_parse_public_key(public_key: str) -> PublicKeyPayload:
    """Decode and fully validate an Authdog public key (``pk_…``)."""
    if not public_key:
        raise PublicKeyError("Public key is not defined")

    if not public_key.startswith("pk_"):
        raise PublicKeyError("Invalid public key")

    raw = public_key[len("pk_") :]
    try:
        # urlsafe + padding tolerant: pad to a multiple of 4.
        padded = raw + "=" * (-len(raw) % 4)
        decoded = base64.b64decode(padded).decode("utf-8")
        payload = json.loads(decoded)
    except (binascii.Error, ValueError, UnicodeDecodeError) as exc:
        raise PublicKeyError("Failed to parse public key") from exc

    if not isinstance(payload, dict):
        raise PublicKeyError("Invalid public key payload")

    environment_id = payload.get("environmentId")
    identity_host = payload.get("identityHost")

    if not isinstance(environment_id, str) or not environment_id:
        raise PublicKeyError("Invalid public key: missing environmentId")
    if not isinstance(identity_host, str) or not identity_host:
        raise PublicKeyError("Invalid public key: missing identityHost")

    safe_host = assert_trusted_identity_host(identity_host)

    known = {"environmentId", "identityHost", "version", "region"}
    return PublicKeyPayload(
        environment_id=environment_id,
        identity_host=safe_host,
        version=payload.get("version"),
        region=payload.get("region"),
        extra={k: v for k, v in payload.items() if k not in known},
    )
