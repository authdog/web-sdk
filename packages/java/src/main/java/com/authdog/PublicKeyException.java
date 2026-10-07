package com.authdog;

/** Raised when a public key or its identity host is invalid or untrusted. */
public final class PublicKeyException extends IllegalArgumentException {
    public PublicKeyException(String message) {
        super(message);
    }
}
