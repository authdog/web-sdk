package com.authdog;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.json.JSONObject;

/** Identity-provider (OIDC {@code userinfo}) lookups. */
public final class Identity {
    private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    private Identity() {}

    public static String fetch(String url, String bearerToken) throws Exception {
        URI target = URI.create(url);
        String origin = target.getScheme() + "://" + target.getHost() + (target.getPort() == -1 ? "" : ":" + target.getPort());
        PublicKeys.assertTrustedIdentityHost(origin);
        HttpRequest request = HttpRequest.newBuilder(target)
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + bearerToken)
                .GET()
                .build();
        HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("failed to fetch user info (status " + response.statusCode() + ")");
        }
        return response.body();
    }

    public static String userInfoUrl(String identityHost, String environmentId) {
        String safeHost = PublicKeys.assertTrustedIdentityHost(identityHost);
        return safeHost + "/oidc/" + URLEncoder.encode(environmentId, StandardCharsets.UTF_8).replace("+", "%20") + "/userinfo";
    }

    public static boolean isAuthenticated(JSONObject data) {
        if (data == null) {
            return false;
        }
        Object meta = data.opt("meta");
        if (!(meta instanceof JSONObject)) {
            return false;
        }
        if (((JSONObject) meta).optInt("code", -1) != 200) {
            return false;
        }
        return data.has("user") && !data.isNull("user");
    }
}
