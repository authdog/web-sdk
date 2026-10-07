package com.authdog;

/** Decoded contents of an Authdog public key (`pk_…`). */
public record PublicKeyPayload(String environmentId, String identityHost, String version, String region) {}
