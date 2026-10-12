package com.authdog;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

public class BillingTest {
    @Test
    void listPlansRejectsUntrustedHost() {
        assertThrows(
                PublicKeyException.class,
                () -> Billing.listBillingPlans("https://evil.example", "env-1", "user"));
    }
}
