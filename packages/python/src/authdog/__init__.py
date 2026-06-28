"""Authdog SDK for Python.

Framework-agnostic core (public-key validation, cookie parsing, identity
lookups, redirect sanitization) lives at the top level; the per-framework
bindings live in their own submodules: :mod:`authdog.fastapi`,
:mod:`authdog.flask`, :mod:`authdog.django`, :mod:`authdog.starlette`, and
:mod:`authdog.aiohttp`. Each exposes an ``Authdog`` class with a session
resolver, a ``require_auth`` gate, and a ``logout`` helper.
"""

from __future__ import annotations

from .cookies import SESSION_COOKIE_NAME, get_session_token, parse_cookies
from .identity import fetch_user_data, is_authenticated_user_info
from .public_key import (
    PublicKeyError,
    PublicKeyPayload,
    assert_trusted_identity_host,
    validate_and_parse_public_key,
)
from .redirects import sanitize_redirect_path

__all__ = [
    "SESSION_COOKIE_NAME",
    "PublicKeyError",
    "PublicKeyPayload",
    "assert_trusted_identity_host",
    "fetch_user_data",
    "get_session_token",
    "is_authenticated_user_info",
    "parse_cookies",
    "sanitize_redirect_path",
    "validate_and_parse_public_key",
]

__version__ = "0.1.0"
