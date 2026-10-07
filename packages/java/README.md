# authdog-java

Authdog SDK for Java servers. A Jakarta Servlet filter attaches the session, a
second filter is the auth gate, and a logout servlet expires `authdog-session`.
The wire contract matches the Node, Python, Go, Rust, and Kotlin SDKs: the same
cookie, the same OIDC `userinfo` flow, and the same trusted identity-host
allowlist.

## Install

```kotlin
dependencies {
    implementation("com.authdog:authdog-java:0.1.0")
    // Provided by Tomcat, Jetty, or Spring Boot.
    compileOnly("jakarta.servlet:jakarta.servlet-api:6.0.0")
}
```

## Quick start

```java
Authdog authdog = new Authdog(System.getenv("PK_AUTHDOG"));

FilterRegistration.Dynamic session = servletContext.addFilter(
        "authdog", new AuthdogFilter(authdog));
session.addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), false, "/*");

FilterRegistration.Dynamic guard = servletContext.addFilter(
        "authdog-required", new RequireAuthFilter(authdog));
guard.addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), false, "/me");

servletContext.addServlet("logout", new LogoutServlet(authdog))
        .addMapping("/logout");
```

`AuthdogFilter` never blocks. `RequireAuthFilter` returns
`401 {"error":"Unauthorized"}` unless `userinfo` reports `meta.code == 200`
with a user. Logout reads `redirect_uri`, keeps only same-origin paths, and
sets:

```
authdog-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax
```

`Secure` is added when `NODE_ENV` or `ENV` is `production`.

## Security

- The public key is validated once. An identity host outside `authdog.com`,
  `authdog.xyz`, and `AUTHDOG_ALLOWED_IDENTITY_HOSTS` — or any private,
  loopback, or link-local address — fails at startup.
- The bearer token is sent only after that allowlist check runs again.
- A failed userinfo lookup is anonymous. It does not throw and it does not
  authenticate the request.

## License

MIT
