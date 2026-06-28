"""Open-redirect protection for logout / post-auth redirects."""

from __future__ import annotations

import re

__all__ = ["sanitize_redirect_path"]

_SCHEME_RE = re.compile(r"^[a-z][a-z0-9+.-]*:", re.IGNORECASE)
_CONTROL_OR_BACKSLASH_RE = re.compile(r"[\\\x00-\x1f]")


def sanitize_redirect_path(target: object, fallback: str = "/") -> str:
    """Return a safe, same-origin redirect target.

    Only relative paths are allowed. A value is rejected (falling back to
    ``fallback``) if it is empty / not a string, is protocol-relative
    (``//`` or ``/\\``), contains a scheme, or contains a backslash / control
    character that a browser might normalize to ``/``.
    """
    if not isinstance(target, str) or not target:
        return fallback

    if (
        not target.startswith("/")
        or target.startswith("//")
        or target.startswith("/\\")
    ):
        return fallback

    if _CONTROL_OR_BACKSLASH_RE.search(target):
        return fallback

    if _SCHEME_RE.match(target):
        return fallback

    return target
