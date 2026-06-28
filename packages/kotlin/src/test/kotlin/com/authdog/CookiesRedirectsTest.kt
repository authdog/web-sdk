package com.authdog

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class CookiesTest {
    @Test
    fun keepsEqualsInValue() {
        val cookies = parseCookies("authdog-session=ab=cd==; other=1")
        assertEquals("authdog-session" to "ab=cd==", cookies[0])
        assertEquals("other" to "1", cookies[1])
    }

    @Test
    fun decodesPercentEncoding() {
        assertEquals("a b", parseCookies("k=a%20b")[0].second)
    }

    @Test
    fun prefersBearerThenCookie() {
        assertEquals("abc", getSessionToken("Bearer abc", "authdog-session=cookie"))
        assertEquals("cookie", getSessionToken(null, "authdog-session=cookie"))
        assertNull(getSessionToken(null, "other=1"))
    }
}

class RedirectsTest {
    @Test
    fun allowsRelativePaths() {
        assertEquals("/dashboard", sanitizeRedirectPath("/dashboard", "/"))
        assertEquals("/a/b?x=1", sanitizeRedirectPath("/a/b?x=1", "/"))
    }

    @Test
    fun rejectsOpenRedirects() {
        val bad = listOf("//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "", "/\tfoo")
        for (b in bad) {
            assertEquals("/", sanitizeRedirectPath(b, "/"), b)
        }
        assertEquals("/", sanitizeRedirectPath(null, "/"))
    }
}
