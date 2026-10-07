package com.authdog;

import org.json.JSONObject;

/** Per-request authentication context. A failed lookup is anonymous, never an error. */
public record AuthdogContext(String token, Object user, boolean authenticated, JSONObject userInfo) {
    public static AuthdogContext anonymous() {
        return new AuthdogContext(null, null, false, null);
    }
}
