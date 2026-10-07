# authdog

Authdog client for Flutter and Dart. Sign-in opens the system browser and
returns through a deep link. The package does not depend on the Flutter SDK, so
`dart test` runs on the Dart VM and a Flutter app can depend on it directly.

## Install

```yaml
dependencies:
  authdog:
    path: packages/flutter
```

## Quick start

```dart
final authdog = AuthdogClient(
  publicKey: 'pk_…',
  redirectUri: 'myapp://auth/callback',
  openUrl: (url) => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication),
  storage: secureStorageAdapter,
  fetcher: (url, token) => httpGet(url, token),
);
authdog.signIn();
authdog.handleCallback(callbackUrl);
final user = authdog.getUser();
authdog.signOut();
```

Pass `url_launcher` as `openUrl` and `flutter_secure_storage` as `storage`.
`isAuthenticated()` reports token presence only. The public key is rejected
unless its identity host is on the Authdog allowlist.

## License

MIT
