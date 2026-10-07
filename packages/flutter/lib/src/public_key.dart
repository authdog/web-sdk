import 'dart:convert';

class PublicKeyPayload {
  final String environmentId;
  final String identityHost;
  const PublicKeyPayload(this.environmentId, this.identityHost);
}

class AuthdogException implements Exception {
  final String message;
  AuthdogException(this.message);
  @override
  String toString() => message;
}

const _defaultSuffixes = ['authdog.com', 'authdog.xyz'];

String assertTrustedIdentityHost(String identityHost, {String? extraHosts}) {
  final uri = Uri.tryParse(identityHost);
  if (uri == null || uri.scheme.isEmpty || uri.host.isEmpty) {
    throw AuthdogException('Invalid identity host');
  }
  if (uri.scheme.toLowerCase() != 'https') {
    throw AuthdogException('Identity host must use https');
  }
  final hostname = uri.host.toLowerCase();
  if (_isPrivate(hostname) || !_allowed(hostname, extraHosts)) {
    throw AuthdogException('Untrusted identity host');
  }
  return identityHost.replaceAll(RegExp(r'/+$'), '');
}

PublicKeyPayload validateAndParsePublicKey(String publicKey, {String? extraHosts}) {
  if (publicKey.isEmpty) throw AuthdogException('Public key is not defined');
  if (!publicKey.startsWith('pk_')) throw AuthdogException('Invalid public key');
  try {
    final raw = publicKey.substring(3);
    final padded = raw + ('=' * ((4 - raw.length % 4) % 4));
    final decoded = utf8.decode(base64.decode(padded));
    final payload = jsonDecode(decoded);
    if (payload is! Map) throw AuthdogException('Invalid public key payload');
    final environmentId = payload['environmentId'];
    final identityHost = payload['identityHost'];
    if (environmentId is! String || environmentId.isEmpty) {
      throw AuthdogException('Invalid public key: missing environmentId');
    }
    if (identityHost is! String || identityHost.isEmpty) {
      throw AuthdogException('Invalid public key: missing identityHost');
    }
    return PublicKeyPayload(
      environmentId,
      assertTrustedIdentityHost(identityHost, extraHosts: extraHosts),
    );
  } on AuthdogException {
    rethrow;
  } catch (_) {
    throw AuthdogException('Failed to parse public key');
  }
}

bool _allowed(String hostname, String? extraHosts) {
  final suffixes = [..._defaultSuffixes];
  for (final part in (extraHosts ?? '').split(',')) {
    final trimmed = part.trim().toLowerCase();
    if (trimmed.isNotEmpty) suffixes.add(trimmed);
  }
  return suffixes.any((suffix) => hostname == suffix || hostname.endsWith('.$suffix'));
}

bool _isPrivate(String hostname) {
  var h = hostname.toLowerCase();
  if (h.startsWith('[') && h.endsWith(']') && h.length > 2) {
    h = h.substring(1, h.length - 1);
  }
  if (h == 'localhost' || h.endsWith('.localhost')) return true;
  if (h.startsWith('127.') || h.startsWith('10.') || h.startsWith('192.168.') || h.startsWith('169.254.')) {
    return true;
  }
  if (RegExp(r'^172\.(1[6-9]|2\d|3[01])\.').hasMatch(h)) return true;
  if (h == '::1') return true;
  return h.startsWith('fc') || h.startsWith('fd');
}
