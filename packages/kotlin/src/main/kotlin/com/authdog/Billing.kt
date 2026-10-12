package com.authdog

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private val lenientJson = Json { ignoreUnknownKeys = true }

class BillingException(message: String) : RuntimeException(message)

/** List publicly-visible billing plans. No auth required. */
suspend fun listBillingPlans(
    client: HttpClient,
    identityHost: String,
    environmentId: String,
    forResource: String = "user",
): JsonObject {
    val safeHost = assertTrustedIdentityHost(identityHost)
    val forParam = if (forResource == "org") "org" else "user"
    val env = percentEncodePathSegment(environmentId)
    val url = "$safeHost/billing/$env/plans?for=$forParam"
    return billingJsonRequest(client, url, null, null)
}

suspend fun getBillingSubscription(
    client: HttpClient,
    identityHost: String,
    environmentId: String,
    token: String,
): JsonObject {
    val safeHost = assertTrustedIdentityHost(identityHost)
    val env = percentEncodePathSegment(environmentId)
    val url = "$safeHost/billing/$env/subscription"
    return billingJsonRequest(client, url, token, null)
}

suspend fun createBillingSubscription(
    client: HttpClient,
    identityHost: String,
    environmentId: String,
    token: String,
    planId: String,
    planPeriod: String = "month",
): JsonObject {
    val safeHost = assertTrustedIdentityHost(identityHost)
    val env = percentEncodePathSegment(environmentId)
    val url = "$safeHost/billing/$env/subscriptions"
    val body =
        buildJsonObject {
            put("planId", planId)
            put("planPeriod", planPeriod.ifEmpty { "month" })
        }
    return billingJsonRequest(client, url, token, body)
}

suspend fun cancelBillingSubscription(
    client: HttpClient,
    identityHost: String,
    environmentId: String,
    token: String,
): JsonObject {
    val safeHost = assertTrustedIdentityHost(identityHost)
    val env = percentEncodePathSegment(environmentId)
    val url = "$safeHost/billing/$env/subscriptions/cancel"
    return billingJsonRequest(client, url, token, null)
}

private suspend fun billingJsonRequest(
    client: HttpClient,
    url: String,
    token: String?,
    jsonBody: JsonObject?,
): JsonObject {
    val response =
        if (jsonBody == null) {
            client.get(url) {
                token?.let { header("Authorization", "Bearer $it") }
            }
        } else {
            client.post(url) {
                token?.let { header("Authorization", "Bearer $it") }
                contentType(ContentType.Application.Json)
                setBody(jsonBody.toString())
            }
        }

    val text = response.bodyAsText()
    val parsed =
        if (text.isBlank()) JsonObject(emptyMap()) else lenientJson.parseToJsonElement(text).jsonObject

    if (!response.status.isSuccess()) {
        val message =
            parsed["meta"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                ?: "Request failed (status ${response.status.value})"
        throw BillingException(message)
    }
    return parsed
}
