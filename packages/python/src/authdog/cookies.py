"""Cookie parsing and session-token extraction."""

from __future__ import annotations

import re
from urllib.parse import unquote

__all__ = ["SESSION_COOKIE_NAME", "parse_cookies", "get_session_token"]

#: Name of the cookie that carries the Authdog session token.
SESSION_COOKIE_NAME = "authdog-session"

_BEARER_RE = re.compile(r"^Bearer\s+", re.IGNORECASE)


def parse_cookies(cookie_header: str | None) -> dict[str, str]:
    """Parse a ``Cookie`` request header into a name → value mapping.

    Splits each pair on the FIRST ``=`` only — cookie values routinely contain
    ``=`` (base64 padding, JWTs), and a naive ``split("=")`` would silently
    truncate the value and corrupt the session token. Values are URL-decoded to
    mirror the ``encodeURIComponent`` used when the cookie is written.
    """
    if not cookie_header:
        return {}

    cookies: dict[str, str] = {}
    for part in cookie_header.split(";"):
        trimmed = part.strip()
        if not trimmed or "=" not in trimmed:
            continue
        name, _, raw_value = trimmed.partition("=")
        name = name.strip()
        if not name:
            continue
        value = raw_value.strip()
        try:
            value = unquote(value)
        except Exception:  # pragma: no cover - unquote is very tolerant
            pass
        cookies[name] = value
    return cookies


def get_session_token(
    authorization: str | None,
    cookie_header: str | None,
) -> str | None:
    """Extract the session token from an ``Authorization`` header or cookie.

    Prefers an explicit ``Authorization: Bearer <token>`` header (API / mobile
    clients), then falls back to the ``authdog-session`` cookie set server-side.
    """
    if authorization and _BEARER_RE.match(authorization):
        token = _BEARER_RE.sub("", authorization).strip()
        if token:
            return token

    return parse_cookies(cookie_header).get(SESSION_COOKIE_NAME)
