# Authdog

Authdog SDK for ASP.NET Core. Middleware attaches the session, a second
registration is the auth gate, and a logout helper expires `authdog-session`.
The cookie, OIDC `userinfo` flow, and trusted identity-host allowlist match the
other Authdog server SDKs.

## Install

```bash
dotnet add package Authdog
```

## Quick start

```csharp
var authdog = new AuthdogClient(Environment.GetEnvironmentVariable("PK_AUTHDOG")!);
app.UseAuthdog(authdog);
app.UseAuthdogRequireAuth(authdog);
app.MapGet("/logout", (HttpContext ctx) => AuthdogLogout.WriteAsync(ctx, authdog));
```

`UseAuthdog` never blocks. `UseAuthdogRequireAuth` writes
`401 {"error":"Unauthorized"}` unless `userinfo` reports success. Logout
sanitizes `redirect_uri` and sets `HttpOnly` and `SameSite=Lax` (`Secure` when
`NODE_ENV`, `ENV`, or `ASPNETCORE_ENVIRONMENT` is `production`).

## License

MIT
