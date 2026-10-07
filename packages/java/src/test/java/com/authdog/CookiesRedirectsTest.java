package com.authdog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class CookiesRedirectsTest {
    @Test
    void parsesCookieValueContainingEquals() {
        var cookies = Cookies.parseCookies("authdog-session=ab=cd==; other=1");
        assertEquals("ab=cd==", cookies.get("authdog-session"));
        assertEquals("1", cookies.get("other"));
    }

    @Test
    void urlDecodesCookieValues() {
        assertEquals("a b", Cookies.parseCookies("k=a%20b").get("k"));
    }

    @Test
    void prefersBearerHeader() {
        assertEquals(
                "abc.def",
                Cookies.getSessionToken("Bearer abc.def", "authdog-session=cookie-token"));
        assertEquals("cookie-token", Cookies.getSessionToken(null, "authdog-session=cookie-token"));
        assertNull(Cookies.getSessionToken(null, "other=1"));
    }

    @Test
    void sanitizesRedirects() {
        assertEquals("/dashboard", Redirects.sanitizeRedirectPath("/dashboard", "/"));
        assertEquals("/a/b?x=1", Redirects.sanitizeRedirectPath("/a/b?x=1", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath("//evil.com", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath("/\\evil.com", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath("https://evil.com", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath("javascript:alert(1)", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath("/\tfoo", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath("", "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath(null, "/"));
        assertEquals("/", Redirects.sanitizeRedirectPath(123, "/"));
    }

    @Test
    void expiresTheSessionCookie() {
        assertEquals(
                "authdog-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
                Redirects.expiredSessionCookie(false));
        assertEquals(
                "authdog-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
                Redirects.expiredSessionCookie(true));
    }
}
