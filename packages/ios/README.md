# Authdog

Authdog client for iOS (and any Apple platform that links Foundation). Sign-in
opens the system browser — `ASWebAuthenticationSession` in an app — and returns
through a deep link. The package does not import UIKit, so `swift test` runs
without a simulator.

## Install

Add the package to your Xcode project from `packages/ios`, or depend on it as a
local Swift package.

## Quick start

```swift
let authdog = try AuthdogClient(
    publicKey: "pk_…",
    redirectUri: "myapp://auth/callback",
    openURL: { url in
        // ASWebAuthenticationSession(url: URL(string: url)!, ...)
        print(url)
    },
    storage: keychainStorage
)
authdog.signIn()
_ = authdog.handleCallback(callbackURL.absoluteString)
let user = authdog.getUser()
authdog.signOut()
```

`isAuthenticated()` reports token presence only. Enforce access on the server.
The public key is rejected unless its identity host is on the Authdog
allowlist.

## License

MIT
