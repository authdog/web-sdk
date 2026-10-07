package com.authdog.android

import com.authdog.PublicKeyException
import java.util.Base64
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AuthdogClientTest {
    private val publicKey = makePk("""{"environmentId":"env_1","identityHost":"https://id.authdog.com"}""")

    @Test
    fun signInOpensTheAuthorizeUrl() {
        val opened = mutableListOf<String>()
        val client = client(opened = opened)
        client.signIn()
        assertTrue(opened.single().startsWith("https://id.authdog.com/oidc/env_1/authorize?"))
        assertTrue(opened.single().contains("redirect_uri=myapp%3A%2F%2Fauth%2Fcallback"))
        assertFalse(client.isAuthenticated())
    }

    @Test
    fun callbackPersistsOnlyJwtShapedTokens() {
        val store = MemoryStorage()
        val client = client(storage = store)
        assertNull(client.handleCallback("myapp://auth/callback?token=nope"))
        assertEquals("aaa.bbb.ccc", client.handleCallback("myapp://auth/callback?token=aaa.bbb.ccc"))
        assertEquals("aaa.bbb.ccc", client.getToken())
        client.signOut()
        assertNull(client.getToken())
    }

    @Test
    fun getUserReadsTheAuthenticatedEnvelope() {
        val store = MemoryStorage()
        val client = client(storage = store, fetcher = { url, token ->
            assertTrue(url.startsWith("https://id.authdog.com/oidc/env_1/userinfo"))
            assertEquals("aaa.bbb.ccc", token)
            """{"meta":{"code":200},"user":{"id":"u1"}}"""
        })
        client.handleCallback("myapp://auth/callback#token=aaa.bbb.ccc")
        assertEquals("u1", client.getUser()?.get("id")?.jsonPrimitive?.content)
    }

    @Test
    fun getUserIsNullWhenUserinfoFails() {
        val store = MemoryStorage()
        val client = client(storage = store, fetcher = { _, _ -> error("down") })
        client.handleCallback("myapp://auth/callback?token=aaa.bbb.ccc")
        assertNull(client.getUser())
    }

    @Test
    fun rejectsUntrustedHosts() {
        val bad = makePk("""{"environmentId":"env_1","identityHost":"https://evil.com"}""")
        assertFailsWith<PublicKeyException> {
            AuthdogClient(bad, "myapp://auth/callback", UrlOpener {}, MemoryStorage())
        }
    }

    private fun client(
        opened: MutableList<String> = mutableListOf(),
        storage: TokenStorage = MemoryStorage(),
        fetcher: UserInfoFetcher = UserInfoFetcher { _, _ -> "{}" },
    ) = AuthdogClient(
        publicKey,
        "myapp://auth/callback",
        UrlOpener { opened += it },
        storage,
        fetcher = fetcher,
    )
}

private class MemoryStorage : TokenStorage {
    private val data = mutableMapOf<String, String>()
    override fun getItem(key: String): String? = data[key]
    override fun setItem(key: String, value: String) { data[key] = value }
    override fun removeItem(key: String) { data.remove(key) }
}

private fun makePk(json: String): String =
    "pk_" + Base64.getEncoder().encodeToString(json.toByteArray(Charsets.UTF_8))
