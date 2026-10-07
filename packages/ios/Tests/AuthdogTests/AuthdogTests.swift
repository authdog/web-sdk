import XCTest
@testable import Authdog

final class MemoryStorage: TokenStorage {
    var data: [String: String] = [:]
    func getItem(_ key: String) -> String? { data[key] }
    func setItem(_ key: String, _ value: String) { data[key] = value }
    func removeItem(_ key: String) { data.removeValue(forKey: key) }
}

final class AuthdogTests: XCTestCase {
    func testPublicKeyAndSession() throws {
        let pk = makePk(#"{"environmentId":"env_1","identityHost":"https://id.authdog.com/"}"#)
        let payload = try PublicKey.validateAndParse(pk)
        XCTAssertEqual(payload.environmentId, "env_1")
        XCTAssertEqual(payload.identityHost, "https://id.authdog.com")
        XCTAssertThrowsError(try PublicKey.assertTrustedIdentityHost("https://evil.com"))
        XCTAssertEqual(try PublicKey.assertTrustedIdentityHost("https://id.self-hosted.test", extraHosts: "id.self-hosted.test"), "https://id.self-hosted.test")

        var opened: [String] = []
        let storage = MemoryStorage()
        let client = try AuthdogClient(
            publicKey: makePk(#"{"environmentId":"env_1","identityHost":"https://id.authdog.com"}"#),
            redirectUri: "myapp://auth/callback",
            openURL: { opened.append($0) },
            storage: storage,
            fetcher: { url, token in
                XCTAssertTrue(url.hasPrefix("https://id.authdog.com/oidc/env_1/userinfo"))
                XCTAssertEqual(token, "aaa.bbb.ccc")
                return #"{"meta":{"code":200},"user":{"id":"u1"}}"#
            }
        )
        client.signIn()
        XCTAssertTrue(opened[0].contains("/oidc/env_1/authorize"))
        XCTAssertNil(client.handleCallback("myapp://auth/callback?token=nope"))
        XCTAssertEqual(client.handleCallback("myapp://auth/callback?token=aaa.bbb.ccc"), "aaa.bbb.ccc")
        XCTAssertEqual(client.getUser()?["id"] as? String, "u1")
        client.signOut()
        XCTAssertNil(client.getToken())
    }

    private func makePk(_ json: String) -> String {
        "pk_" + Data(json.utf8).base64EncodedString()
    }
}
