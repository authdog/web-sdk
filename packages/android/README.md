# authdog-android

Authdog client for native Android apps. Sign-in opens the system browser
(Chrome Custom Tabs) and returns through an app deep link. Public-key parsing
and the trusted identity-host allowlist are the Kotlin core in
[`packages/kotlin`](../kotlin) — this package does not depend on Ktor.

The library is plain Kotlin/JVM so it builds and tests without the Android
SDK. On a device, pass `EncryptedSharedPreferences` as the token store and
Custom Tabs as the URL opener.

## Install

```kotlin
dependencies {
    implementation("com.authdog:authdog-android:0.1.0")
}
```

## Quick start

```kotlin
val authdog = AuthdogClient(
    publicKey = BuildConfig.AUTHDOG_PUBLIC_KEY,
    redirectUri = "myapp://auth/callback",
    openUrl = UrlOpener { url ->
        CustomTabsIntent.Builder().build().launchUrl(context, Uri.parse(url))
    },
    storage = encryptedPrefsStorage(context),
)

authdog.signIn()

// In the activity that receives the deep link:
authdog.handleCallback(intent.data.toString())
val user = authdog.getUser()
authdog.signOut()
```

`isAuthenticated()` reports token presence only. Enforce access on the server.

## License

MIT
