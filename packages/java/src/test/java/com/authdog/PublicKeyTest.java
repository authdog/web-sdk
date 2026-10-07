package com.authdog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class PublicKeyTest {
    private static String makePk(String json) {
        return "pk_" + Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void parsesValidKeyAndTrimsHost() {
        String pk = makePk("{\"environmentId\":\"env_1\",\"identityHost\":\"https://id.authdog.com/\"}");
        PublicKeyPayload payload = PublicKeys.validateAndParsePublicKey(pk);
        assertEquals("env_1", payload.environmentId());
        assertEquals("https://id.authdog.com", payload.identityHost());
    }

    @Test
    void rejectsBadKeys() {
        assertThrows(PublicKeyException.class, () -> PublicKeys.validateAndParsePublicKey(""));
        assertThrows(PublicKeyException.class, () -> PublicKeys.validateAndParsePublicKey("sk_abc"));
        assertThrows(PublicKeyException.class, () -> PublicKeys.validateAndParsePublicKey("pk_!!!notbase64"));
        String missingEnv = makePk("{\"identityHost\":\"https://id.authdog.com\"}");
        assertThrows(PublicKeyException.class, () -> PublicKeys.validateAndParsePublicKey(missingEnv));
    }

    @Test
    void rejectsUntrustedHosts() {
        String[] bad = {
            "http://id.authdog.com",
            "https://id.evil.com",
            "https://localhost",
            "https://127.0.0.1",
            "https://169.254.169.254",
            "https://10.0.0.5",
            "https://authdog.com.evil.com",
        };
        for (String host : bad) {
            assertThrows(PublicKeyException.class, () -> PublicKeys.assertTrustedIdentityHost(host), host);
        }
    }

    @Test
    void acceptsAllowlistedHosts() {
        assertEquals("https://id.authdog.xyz", PublicKeys.assertTrustedIdentityHost("https://id.authdog.xyz"));
        assertEquals("https://authdog.com", PublicKeys.assertTrustedIdentityHost("https://authdog.com"));
    }

    @Test
    void acceptsExtraHostFromEnvValue() {
        assertEquals(
                "https://id.self-hosted.test",
                PublicKeys.assertTrustedIdentityHost("https://id.self-hosted.test", "id.self-hosted.test"));
    }
}
