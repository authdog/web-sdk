package com.authdog;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import org.json.JSONObject;

/**
 * Public-key decoding and trusted identity-host validation.
 *
 * <p>Mirrors {@code @authdog/node-commons}: the identity host is decoded from the public key, so it
 * is checked against an allowlist before it is ever used as a request target.
 */
public final class PublicKeys {
    private static final List<String> DEFAULT_ALLOWED_HOST_SUFFIXES = List.of("authdog.com", "authdog.xyz");

    private PublicKeys() {}

    public static String assertTrustedIdentityHost(String identityHost) {
        return assertTrustedIdentityHost(identityHost, System.getenv("AUTHDOG_ALLOWED_IDENTITY_HOSTS"));
    }

    static String assertTrustedIdentityHost(String identityHost, String extraHosts) {
        final URI url;
        try {
            url = new URI(identityHost);
        } catch (Exception ex) {
            throw new PublicKeyException("Invalid identity host");
        }

        String scheme = url.getScheme();
        if (scheme == null || url.getHost() == null) {
            throw new PublicKeyException("Invalid identity host");
        }
        if (!"https".equalsIgnoreCase(scheme)) {
            throw new PublicKeyException("Identity host must use https");
        }

        String hostname = url.getHost().toLowerCase(Locale.ROOT);
        if (isPrivateOrLoopbackHost(hostname)) {
            throw new PublicKeyException("Untrusted identity host");
        }

        boolean allowed = false;
        for (String suffix : allowedHostSuffixes(extraHosts)) {
            if (hostname.equals(suffix) || hostname.endsWith("." + suffix)) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            throw new PublicKeyException("Untrusted identity host");
        }

        return identityHost.replaceAll("/+$", "");
    }

    public static PublicKeyPayload validateAndParsePublicKey(String publicKey) {
        if (publicKey == null || publicKey.isEmpty()) {
            throw new PublicKeyException("Public key is not defined");
        }
        if (!publicKey.startsWith("pk_")) {
            throw new PublicKeyException("Invalid public key");
        }

        String raw = publicKey.substring(3);
        String padded = raw + "=".repeat((4 - raw.length() % 4) % 4);
        final String decoded;
        try {
            decoded = new String(Base64.getDecoder().decode(padded), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            throw new PublicKeyException("Failed to parse public key");
        }

        final JSONObject payload;
        try {
            payload = new JSONObject(decoded);
        } catch (Exception ex) {
            throw new PublicKeyException("Failed to parse public key");
        }

        if (payload == null) {
            throw new PublicKeyException("Invalid public key payload");
        }

        String environmentId = payload.optString("environmentId", "");
        String identityHost = payload.optString("identityHost", "");
        if (environmentId.isEmpty()) {
            throw new PublicKeyException("Invalid public key: missing environmentId");
        }
        if (identityHost.isEmpty()) {
            throw new PublicKeyException("Invalid public key: missing identityHost");
        }

        String safeHost = assertTrustedIdentityHost(identityHost);
        String version = payload.has("version") && !payload.isNull("version") ? payload.optString("version", null) : null;
        String region = payload.has("region") && !payload.isNull("region") ? payload.optString("region", null) : null;
        return new PublicKeyPayload(environmentId, safeHost, version, region);
    }

    private static List<String> allowedHostSuffixes(String extraHosts) {
        List<String> suffixes = new ArrayList<>(DEFAULT_ALLOWED_HOST_SUFFIXES);
        if (extraHosts != null) {
            for (String part : extraHosts.split(",")) {
                String trimmed = part.trim().toLowerCase(Locale.ROOT);
                if (!trimmed.isEmpty()) {
                    suffixes.add(trimmed);
                }
            }
        }
        return suffixes;
    }

    private static boolean isPrivateOrLoopbackHost(String hostname) {
        String h = hostname.toLowerCase(Locale.ROOT);
        if (h.startsWith("[") && h.endsWith("]") && h.length() > 2) {
            h = h.substring(1, h.length() - 1);
        }
        if (h.equals("localhost") || h.endsWith(".localhost")) {
            return true;
        }
        if (h.startsWith("127.") || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("169.254.")) {
            return true;
        }
        if (h.matches("172\\.(1[6-9]|2\\d|3[01])\\..*")) {
            return true;
        }
        if (h.equals("::1") || h.equals("[::1]")) {
            return true;
        }
        return h.startsWith("fc") || h.startsWith("fd") || h.startsWith("[fc") || h.startsWith("[fd");
    }
}
