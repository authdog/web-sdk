# authdog/authdog

Authdog SDK for PHP. It speaks the same `authdog-session` cookie, OIDC
`userinfo` flow, and trusted identity-host allowlist as the other Authdog
server SDKs.

PSR-15 middleware covers Slim, Mezzio, and any other PSR-15 stack. A
Laravel-compatible pair duck-types `$request->header()` so Illuminate is not a
hard dependency.

## Install

```bash
composer require authdog/authdog
```

## Quick start

```php
$authdog = new Authdog\Authdog(getenv('PK_AUTHDOG'));

// PSR-15
$app->pipe(new Authdog\Http\AttachSession($authdog));
$app->pipe('/me', new Authdog\Http\RequireAuth($authdog, $responseFactory, $streamFactory));

// Laravel
// App\Http\Kernel middleware:
// \Authdog\Http\LaravelRequireAuth::class
```

`resolve()` never throws. `requireAuth()` returns status `401` and
`{"error":"Unauthorized"}` unless `userinfo` reports `meta.code == 200` with a
user. Logout sanitizes `redirect_uri` and expires the session cookie with
`HttpOnly` and `SameSite=Lax` (`Secure` when `NODE_ENV` or `ENV` is
`production`).

## License

MIT
