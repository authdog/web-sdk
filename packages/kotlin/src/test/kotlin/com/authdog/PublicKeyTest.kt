package com.authdog

import java.util.Base64
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

private fun makePk(json: String): String =
    "pk_" + Base64.getEncoder().encodeToString(json.toByteArray(Charsets.UTF_8))

class PublicKeyTest {
    @Test
    fun parsesValidKeyAndTrimsHost() {
        val pk = makePk("""{"environmentId":"env_1","identityHost":"https://id.authdog.com/"}""")
        val p = validateAndParsePublicKey(pk)
        assertEquals("env_1", p.environmentId)
        assertEquals("https://id.authdog.com", p.identityHost)
    }

    @Test
    fun rejectsBadKeys() {
        assertFailsWith<PublicKeyException> { validateAndParsePublicKey("") }
        assertFailsWith<PublicKeyException> { validateAndParsePublicKey("sk_abc") }
        assertFailsWith<PublicKeyException> { validateAndParsePublicKey("pk_!!!notbase64") }
        val missingEnv = makePk("""{"identityHost":"https://id.authdog.com"}""")
        assertFailsWith<PublicKeyException> { validateAndParsePublicKey(missingEnv) }
    }

    @Test
    fun rejectsUntrustedHosts() {
        val bad = listOf(
            "http://id.authdog.com",
            "https://id.evil.com",
            "https://localhost",
            "https://127.0.0.1",
            "https://169.254.169.254",
            "https://10.0.0.5",
            "https://authdog.com.evil.com",
        )
        for (host in bad) {
            assertFailsWith<PublicKeyException>(message = "$host should be rejected") {
                assertTrustedIdentityHost(host)
            }
        }
    }

    @Test
    fun acceptsAllowlistedHosts() {
        assertEquals("https://id.authdog.xyz", assertTrustedIdentityHost("https://id.authdog.xyz"))
        assertEquals("https://authdog.com", assertTrustedIdentityHost("https://authdog.com"))
        assertTrue(true)
    }
}
