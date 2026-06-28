import pytest

from authdog import get_session_token, parse_cookies, sanitize_redirect_path


def test_parses_cookie_value_containing_equals():
    cookies = parse_cookies("authdog-session=ab=cd==; other=1")
    assert cookies["authdog-session"] == "ab=cd=="
    assert cookies["other"] == "1"


def test_url_decodes_cookie_values():
    assert parse_cookies("k=a%20b")["k"] == "a b"


def test_parse_cookies_empty():
    assert parse_cookies(None) == {}
    assert parse_cookies("") == {}


def test_get_session_token_prefers_bearer_header():
    token = get_session_token("Bearer abc.def", "authdog-session=cookie-token")
    assert token == "abc.def"


def test_get_session_token_falls_back_to_cookie():
    assert get_session_token(None, "authdog-session=cookie-token") == "cookie-token"


def test_get_session_token_none_when_absent():
    assert get_session_token(None, "other=1") is None


@pytest.mark.parametrize(
    "target,expected",
    [
        ("/dashboard", "/dashboard"),
        ("/a/b?x=1", "/a/b?x=1"),
        ("//evil.com", "/"),
        ("/\\evil.com", "/"),
        ("https://evil.com", "/"),
        ("javascript:alert(1)", "/"),
        ("/\tfoo", "/"),
        ("", "/"),
        (None, "/"),
        (123, "/"),
    ],
)
def test_sanitize_redirect_path(target, expected):
    assert sanitize_redirect_path(target) == expected
