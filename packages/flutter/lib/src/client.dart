import 'dart:convert';

import 'public_key.dart';
import 'session.dart';

typedef UrlOpener = void Function(String url);
typedef UserInfoFetcher = String Function(String url, String bearerToken);

abstract class TokenStorage {
  String? getItem(String key);
  void setItem(String key, String value);
  void removeItem(String key);
}

class MemoryTokenStorage implements TokenStorage {
  final Map<String, String> _data = {};
  @override
  String? getItem(String key) => _data[key];
  @override
  void setItem(String key, String value) => _data[key] = value;
  @override
  void removeItem(String key) => _data.remove(key);
}

/// Flutter / Dart client. Pass `url_launcher` or a Custom Tab as [openUrl], and
/// `flutter_secure_storage` as [storage].
class AuthdogClient {
  final PublicKeyPayload payload;
  final String _publicKey;
  final String redirectUri;
  final UrlOpener openUrl;
  final TokenStorage storage;
  final String storageKey;
  final UserInfoFetcher _fetcher;

  AuthdogClient({
    required String publicKey,
    required this.redirectUri,
    required this.openUrl,
    required this.storage,
    this.storageKey = tokenStorageKey,
    UserInfoFetcher? fetcher,
  })  : _publicKey = publicKey,
        payload = validateAndParsePublicKey(publicKey),
        _fetcher = fetcher ?? _defaultFetch {
    if (redirectUri.isEmpty) {
      throw AuthdogException('redirectUri is not defined');
    }
  }

  String? getToken() => storage.getItem(storageKey);
  bool isAuthenticated() => getToken() != null;

  void signIn({String? prompt}) {
    openUrl(buildAuthorizeUrl(
      payload: payload,
      publicKey: _publicKey,
      redirectUri: redirectUri,
      prompt: prompt,
    ));
  }

  void signUp() => signIn(prompt: 'signup');

  String? handleCallback(String callbackUrl) {
    final token = extractTokenFromRedirect(callbackUrl);
    if (token == null || !isJwtShaped(token)) return null;
    storage.setItem(storageKey, token);
    return token;
  }

  void signOut() => storage.removeItem(storageKey);

  Map<String, dynamic>? getUser() {
    final token = getToken();
    if (token == null) return null;
    try {
      final host = assertTrustedIdentityHost(payload.identityHost);
      final url = '$host/oidc/${Uri.encodeComponent(payload.environmentId)}/userinfo';
      final body = _fetcher(url, token);
      final info = jsonDecode(body);
      if (info is! Map) return null;
      final meta = info['meta'];
      if (meta is! Map || meta['code'] != 200) return null;
      final user = info['user'];
      if (user is! Map) return null;
      return Map<String, dynamic>.from(user);
    } catch (_) {
      return null;
    }
  }
}

String _defaultFetch(String url, String bearerToken) {
  final present = bearerToken.isNotEmpty;
  throw AuthdogException(
    'Pass a UserInfoFetcher. No HTTP client is bundled for $url (token ${present ? "present" : "missing"}).',
  );
}
