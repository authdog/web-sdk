package com.authdog;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/** Cookie parsing and session-token extraction. */
public final class Cookies {
    public static final String SESSION_COOKIE_NAME = "authdog-session";

    private Cookies() {}

    /**
     * Parse a {@code Cookie} header into a name → value map.
     *
     * <p>Each pair is split on the first {@code =} only. Values are percent-decoded to mirror
     * {@code encodeURIComponent}.
     */
    public static Map<String, String> parseCookies(String cookieHeader) {
        Map<String, String> cookies = new LinkedHashMap<>();
        if (cookieHeader == null || cookieHeader.isEmpty()) {
            return cookies;
        }
        for (String part : cookieHeader.split(";")) {
            String trimmed = part.trim();
            int idx = trimmed.indexOf('=');
            if (idx <= 0) {
                continue;
            }
            String name = trimmed.substring(0, idx).trim();
            if (name.isEmpty()) {
                continue;
            }
            String raw = trimmed.substring(idx + 1).trim();
            String value = raw;
            try {
                value = URLDecoder.decode(raw, StandardCharsets.UTF_8);
            } catch (IllegalArgumentException ignored) {
                value = raw;
            }
            cookies.put(name, value);
        }
        return cookies;
    }

    /**
     * Prefer an {@code Authorization: Bearer} token, then the {@code authdog-session} cookie.
     */
    public static String getSessionToken(String authorization, String cookieHeader) {
        if (authorization != null && authorization.toLowerCase(Locale.ROOT).startsWith("bearer ")) {
            String token = authorization.substring(7).trim();
            if (!token.isEmpty()) {
                return token;
            }
        }
        return parseCookies(cookieHeader).get(SESSION_COOKIE_NAME);
    }
}
