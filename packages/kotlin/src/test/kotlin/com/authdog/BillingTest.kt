package com.authdog

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class BillingTest {
    @Test
    fun untrustedHostFailsBeforeRequest() = runTest {
        val client = HttpClient(MockEngine { respond("", HttpStatusCode.OK) }) {
            install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
        }
        assertThrows<PublicKeyException> {
            listBillingPlans(client, "https://evil.example", "env-1")
        }
    }
}
