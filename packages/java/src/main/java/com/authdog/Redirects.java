package com.authdog;

/** Open-redirect protection and the expired session cookie. */
public final class Redirects {
    private Redirects() {}

    public static String sanitizeRedirectPath(Object target, String fallback) {
        if (!(target instanceof String) || ((String) target).isEmpty()) {
            return fallback;
        }
        String value = (String) target;
        if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
            return fallback;
        }
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c == '\\' || c < 0x20 || c == 0x7f) {
                return fallback;
            }
        }
        if (hasScheme(value)) {
            return fallback;
        }
        return value;
    }

    /** {@code HttpOnly}, {@code SameSite=Lax}, and {@code Secure} when {@code production} is true. */
    public static String expiredSessionCookie(boolean production) {
        String secure = production ? " Secure;" : "";
        return Cookies.SESSION_COOKIE_NAME
                + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;"
                + secure
                + " SameSite=Lax";
    }

    public static boolean isProduction() {
        return "production".equalsIgnoreCase(System.getenv("NODE_ENV"))
                || "production".equalsIgnoreCase(System.getenv("ENV"));
    }

    private static boolean hasScheme(String value) {
        char first = value.charAt(0);
        if (!isAlpha(first)) {
            return false;
        }
        for (int i = 1; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c == ':') {
                return true;
            }
            if (!(isAlpha(c) || (c >= '0' && c <= '9') || c == '+' || c == '.' || c == '-')) {
                return false;
            }
        }
        return false;
    }

    private static boolean isAlpha(char c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    }
}
