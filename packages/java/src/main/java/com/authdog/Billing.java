package com.authdog;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.json.JSONObject;

/** Identity-host billing API (plans and subscriptions). */
public final class Billing {
    private static final HttpClient HTTP =
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    private Billing() {}

    private static JSONObject jsonRequest(
            String method, String url, String bearerToken, String jsonBody) throws Exception {
        URI target = URI.create(url);
        String origin =
                target.getScheme()
                        + "://"
                        + target.getHost()
                        + (target.getPort() == -1 ? "" : ":" + target.getPort());
        PublicKeys.assertTrustedIdentityHost(origin);

        HttpRequest.Builder builder =
                HttpRequest.newBuilder(target).timeout(Duration.ofSeconds(10));
        if (bearerToken != null && !bearerToken.isEmpty()) {
            builder.header("Authorization", "Bearer " + bearerToken);
        }
        if ("POST".equals(method)) {
            builder.header("Content-Type", "application/json");
            builder.POST(
                    jsonBody == null
                            ? HttpRequest.BodyPublishers.noBody()
                            : HttpRequest.BodyPublishers.ofString(jsonBody));
        } else {
            builder.GET();
        }

        HttpResponse<String> response = HTTP.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        JSONObject body =
                response.body() == null || response.body().isEmpty()
                        ? new JSONObject()
                        : new JSONObject(response.body());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String message = "Request failed (status " + response.statusCode() + ")";
            if (body.has("meta") && body.get("meta") instanceof JSONObject meta) {
                if (meta.has("message")) {
                    message = meta.getString("message");
                }
            }
            throw new IllegalStateException(message);
        }
        return body;
    }

    public static JSONObject listBillingPlans(String identityHost, String environmentId, String forResource)
            throws Exception {
        String safeHost = PublicKeys.assertTrustedIdentityHost(identityHost);
        String forParam = "org".equals(forResource) ? "org" : "user";
        String env = URLEncoder.encode(environmentId, StandardCharsets.UTF_8).replace("+", "%20");
        String url = safeHost + "/billing/" + env + "/plans?for=" + forParam;
        return jsonRequest("GET", url, null, null);
    }

    public static JSONObject getBillingSubscription(
            String identityHost, String environmentId, String token) throws Exception {
        String safeHost = PublicKeys.assertTrustedIdentityHost(identityHost);
        String env = URLEncoder.encode(environmentId, StandardCharsets.UTF_8).replace("+", "%20");
        String url = safeHost + "/billing/" + env + "/subscription";
        return jsonRequest("GET", url, token, null);
    }

    public static JSONObject createBillingSubscription(
            String identityHost,
            String environmentId,
            String token,
            String planId,
            String planPeriod)
            throws Exception {
        String safeHost = PublicKeys.assertTrustedIdentityHost(identityHost);
        String env = URLEncoder.encode(environmentId, StandardCharsets.UTF_8).replace("+", "%20");
        String url = safeHost + "/billing/" + env + "/subscriptions";
        String period = planPeriod == null || planPeriod.isEmpty() ? "month" : planPeriod;
        JSONObject body = new JSONObject();
        body.put("planId", planId);
        body.put("planPeriod", period);
        return jsonRequest("POST", url, token, body.toString());
    }

    public static JSONObject cancelBillingSubscription(
            String identityHost, String environmentId, String token) throws Exception {
        String safeHost = PublicKeys.assertTrustedIdentityHost(identityHost);
        String env = URLEncoder.encode(environmentId, StandardCharsets.UTF_8).replace("+", "%20");
        String url = safeHost + "/billing/" + env + "/subscriptions/cancel";
        return jsonRequest("POST", url, token, null);
    }
}
