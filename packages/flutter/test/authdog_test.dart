import 'dart:convert';

import 'package:authdog/authdog.dart';
import 'package:test/test.dart';

void main() {
  test('sign-in, callback, and userinfo', () {
    final pk = 'pk_${base64Encode(utf8.encode('{"environmentId":"env_1","identityHost":"https://id.authdog.com"}'))}';
    final opened = <String>[];
    final client = AuthdogClient(
      publicKey: pk,
      redirectUri: 'myapp://auth/callback',
      openUrl: opened.add,
      storage: MemoryTokenStorage(),
      fetcher: (url, token) {
        expect(url, startsWith('https://id.authdog.com/oidc/env_1/userinfo'));
        expect(token, 'aaa.bbb.ccc');
        return '{"meta":{"code":200},"user":{"id":"u1"}}';
      },
    );

    client.signIn();
    expect(opened.single, contains('/oidc/env_1/authorize'));
    expect(client.handleCallback('myapp://auth/callback?token=nope'), isNull);
    expect(client.handleCallback('myapp://auth/callback?token=aaa.bbb.ccc'), 'aaa.bbb.ccc');
    expect(client.getUser()?['id'], 'u1');
    client.signOut();
    expect(client.getToken(), isNull);
  });

  test('rejects an untrusted identity host', () {
    final pk = 'pk_${base64Encode(utf8.encode('{"environmentId":"env_1","identityHost":"https://evil.com"}'))}';
    expect(() => validateAndParsePublicKey(pk), throwsA(isA<AuthdogException>()));
  });

  test('sanitizes nothing on the client and still rejects private hosts', () {
    expect(
      () => assertTrustedIdentityHost('https://127.0.0.1'),
      throwsA(isA<AuthdogException>()),
    );
    expect(
      assertTrustedIdentityHost('https://id.authdog.com/'),
      'https://id.authdog.com',
    );
  });
}
