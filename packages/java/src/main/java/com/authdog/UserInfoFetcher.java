package com.authdog;

/** Loads an OIDC {@code userinfo} response body for a bearer token. */
@FunctionalInterface
public interface UserInfoFetcher {
    String fetch(String url, String bearerToken) throws Exception;
}
