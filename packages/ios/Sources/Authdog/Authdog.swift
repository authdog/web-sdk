import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public struct PublicKeyPayload: Equatable {
    public let environmentId: String
    public let identityHost: String
}

public struct AuthdogError: Error, Equatable, CustomStringConvertible {
    public let message: String
    public var description: String { message }
    public init(_ message: String) { self.message = message }
}

public enum PublicKey {
    private static let defaultSuffixes = ["authdog.com", "authdog.xyz"]

    public static func assertTrustedIdentityHost(_ identityHost: String, extraHosts: String? = ProcessInfo.processInfo.environment["AUTHDOG_ALLOWED_IDENTITY_HOSTS"]) throws -> String {
        guard let url = URL(string: identityHost), let host = url.host, let scheme = url.scheme else {
            throw AuthdogError("Invalid identity host")
        }
        guard scheme.lowercased() == "https" else {
            throw AuthdogError("Identity host must use https")
        }
        let hostname = host.lowercased()
        if isPrivateOrLoopback(hostname) || !allowed(hostname, extraHosts: extraHosts) {
            throw AuthdogError("Untrusted identity host")
        }
        return identityHost.replacingOccurrences(of: "/+$", with: "", options: .regularExpression)
    }

    public static func validateAndParse(_ publicKey: String, extraHosts: String? = ProcessInfo.processInfo.environment["AUTHDOG_ALLOWED_IDENTITY_HOSTS"]) throws -> PublicKeyPayload {
        guard !publicKey.isEmpty else { throw AuthdogError("Public key is not defined") }
        guard publicKey.hasPrefix("pk_") else { throw AuthdogError("Invalid public key") }
        let raw = String(publicKey.dropFirst(3))
        let padded = raw + String(repeating: "=", count: (4 - raw.count % 4) % 4)
        guard let data = Data(base64Encoded: padded),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw AuthdogError("Failed to parse public key")
        }
        guard let environmentId = object["environmentId"] as? String, !environmentId.isEmpty else {
            throw AuthdogError("Invalid public key: missing environmentId")
        }
        guard let identityHost = object["identityHost"] as? String, !identityHost.isEmpty else {
            throw AuthdogError("Invalid public key: missing identityHost")
        }
        return PublicKeyPayload(
            environmentId: environmentId,
            identityHost: try assertTrustedIdentityHost(identityHost, extraHosts: extraHosts)
        )
    }

    private static func allowed(_ hostname: String, extraHosts: String?) -> Bool {
        var suffixes = defaultSuffixes
        for part in (extraHosts ?? "").split(separator: ",") {
            let trimmed = part.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            if !trimmed.isEmpty { suffixes.append(trimmed) }
        }
        return suffixes.contains { hostname == $0 || hostname.hasSuffix(".\($0)") }
    }

    private static func isPrivateOrLoopback(_ hostname: String) -> Bool {
        var h = hostname.lowercased()
        if h.hasPrefix("["), h.hasSuffix("]"), h.count > 2 {
            h = String(h.dropFirst().dropLast())
        }
        if h == "localhost" || h.hasSuffix(".localhost") { return true }
        if h.hasPrefix("127.") || h.hasPrefix("10.") || h.hasPrefix("192.168.") || h.hasPrefix("169.254.") { return true }
        if h.range(of: #"^172\.(1[6-9]|2\d|3[01])\."#, options: .regularExpression) != nil { return true }
        if h == "::1" { return true }
        return h.hasPrefix("fc") || h.hasPrefix("fd")
    }
}

public enum Session {
    public static let tokenStorageKey = "authdog_token"
    private static let jwt = try! NSRegularExpression(pattern: #"^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$"#)

    public static func isJwtShaped(_ value: String) -> Bool {
        let range = NSRange(value.startIndex..<value.endIndex, in: value)
        return jwt.firstMatch(in: value, range: range) != nil
    }

    public static func buildAuthorizeURL(payload: PublicKeyPayload, publicKey: String, redirectUri: String, prompt: String? = nil) -> String {
        var components = URLComponents(string: "\(payload.identityHost)/oidc/\(payload.environmentId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? payload.environmentId)/authorize")!
        var items = [
            URLQueryItem(name: "client_id", value: publicKey),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: "openid profile email"),
            URLQueryItem(name: "redirect_uri", value: redirectUri),
        ]
        if let prompt { items.append(URLQueryItem(name: "prompt", value: prompt)) }
        components.queryItems = items
        return components.string!
    }

    public static func extractToken(from redirectURL: String) -> String? {
        var parsable = redirectURL
        if URL(string: parsable) == nil {
            parsable = redirectURL.replacingOccurrences(of: #"^([a-zA-Z][a-zA-Z0-9+.-]*):/?"#, with: "$1://", options: .regularExpression)
        }
        guard let components = URLComponents(string: parsable) else { return nil }
        if let token = components.queryItems?.first(where: { $0.name == "token" })?.value { return token }
        guard let fragment = components.fragment else { return nil }
        return URLComponents(string: "https://localhost/?\(fragment)")?.queryItems?.first(where: { $0.name == "token" })?.value
    }
}

public protocol TokenStorage {
    func getItem(_ key: String) -> String?
    func setItem(_ key: String, _ value: String)
    func removeItem(_ key: String)
}

public struct AuthdogClient {
    public let payload: PublicKeyPayload
    private let publicKey: String
    private let redirectUri: String
    private let openURL: (String) -> Void
    private let storage: TokenStorage
    private let storageKey: String
    private let fetcher: (String, String) throws -> String

    public init(
        publicKey: String,
        redirectUri: String,
        openURL: @escaping (String) -> Void,
        storage: TokenStorage,
        storageKey: String = Session.tokenStorageKey,
        fetcher: @escaping (String, String) throws -> String
    ) throws {
        guard !redirectUri.isEmpty else { throw AuthdogError("redirectUri is not defined") }
        self.publicKey = publicKey
        self.payload = try PublicKey.validateAndParse(publicKey)
        self.redirectUri = redirectUri
        self.openURL = openURL
        self.storage = storage
        self.storageKey = storageKey
        self.fetcher = fetcher
    }

    public init(
        publicKey: String,
        redirectUri: String,
        openURL: @escaping (String) -> Void,
        storage: TokenStorage,
        storageKey: String = Session.tokenStorageKey
    ) throws {
        try self.init(
            publicKey: publicKey,
            redirectUri: redirectUri,
            openURL: openURL,
            storage: storage,
            storageKey: storageKey,
            fetcher: AuthdogClient.defaultFetch
        )
    }

    public func getToken() -> String? { storage.getItem(storageKey) }
    public func isAuthenticated() -> Bool { getToken() != nil }

    public func signIn(prompt: String? = nil) {
        openURL(Session.buildAuthorizeURL(payload: payload, publicKey: publicKey, redirectUri: redirectUri, prompt: prompt))
    }

    public func handleCallback(_ callbackURL: String) -> String? {
        guard let token = Session.extractToken(from: callbackURL), Session.isJwtShaped(token) else { return nil }
        storage.setItem(storageKey, token)
        return token
    }

    public func signOut() { storage.removeItem(storageKey) }

    public func getUser() -> [String: Any]? {
        guard let token = getToken() else { return nil }
        do {
            let host = try PublicKey.assertTrustedIdentityHost(payload.identityHost)
            let env = payload.environmentId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? payload.environmentId
            let body = try fetcher("\(host)/oidc/\(env)/userinfo", token)
            guard let data = body.data(using: .utf8),
                  let object = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let meta = object["meta"] as? [String: Any],
                  let code = meta["code"] as? Int, code == 200,
                  let user = object["user"] as? [String: Any] else {
                return nil
            }
            return user
        } catch {
            return nil
        }
    }

    private static func defaultFetch(url: String, token: String) throws -> String {
        guard let target = URL(string: url) else { throw AuthdogError("Invalid identity host") }
        _ = try PublicKey.assertTrustedIdentityHost("\(target.scheme ?? "")://\(target.host ?? "")")
        var request = URLRequest(url: target)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let semaphore = DispatchSemaphore(value: 0)
        let result = FetchResult()
        URLSession.shared.dataTask(with: request) { data, response, error in
            defer { semaphore.signal() }
            if let error {
                result.value = .failure(error)
                return
            }
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode), let data, let body = String(data: data, encoding: .utf8) else {
                result.value = .failure(AuthdogError("failed to fetch user info"))
                return
            }
            result.value = .success(body)
        }.resume()
        semaphore.wait()
        return try result.value.get()
    }
}

private final class FetchResult: @unchecked Sendable {
    var value: Result<String, Error> = .failure(AuthdogError("failed to fetch user info"))
}
