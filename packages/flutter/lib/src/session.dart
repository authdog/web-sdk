import 'public_key.dart';

const tokenStorageKey = 'authdog_token';
final _jwt = RegExp(r'^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$');

bool isJwtShaped(String value) => _jwt.hasMatch(value);

String buildAuthorizeUrl({
  required PublicKeyPayload payload,
  required String publicKey,
  required String redirectUri,
  String? prompt,
}) {
  final env = Uri.encodeComponent(payload.environmentId);
  return Uri.parse('${payload.identityHost}/oidc/$env/authorize').replace(queryParameters: {
    'client_id': publicKey,
    'response_type': 'code',
    'scope': 'openid profile email',
    'redirect_uri': redirectUri,
    if (prompt != null) 'prompt': prompt,
  }).toString();
}

String? extractTokenFromRedirect(String redirectUrl) {
  var parsable = redirectUrl;
  if (Uri.tryParse(parsable)?.hasScheme != true) {
    parsable = redirectUrl.replaceFirstMapped(RegExp(r'^([a-zA-Z][a-zA-Z0-9+.-]*):/?'), (m) => '${m[1]}://');
  }
  final uri = Uri.tryParse(parsable);
  if (uri == null) return null;
  final queryToken = uri.queryParameters['token'];
  if (queryToken != null) return queryToken;
  if (uri.fragment.isEmpty) return null;
  return Uri.splitQueryString(uri.fragment)['token'];
}
