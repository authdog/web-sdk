# @authdog/react-native

**Authdog SDK for React Native & Expo** — secure session management, hosted
login via deep-linking, and user/permission hooks for your mobile app.

- 🔐 **Secure by default** — token validated as a JWT before storage; identity
  host constrained to the Authdog trusted-host allowlist (no token exfiltration).
- 📦 **Pluggable storage** — bring `expo-secure-store`, AsyncStorage, or your own
  async store. No hard Expo dependency.
- 🪝 **Familiar hooks** — `useUser`, `useSession`, `useSignIn`, `useSignOut`, and
  more, mirroring the rest of the Authdog Web SDK.

## Install

```bash
bun add @authdog/react-native
# secure, hardware-backed token storage (recommended)
npx expo install expo-secure-store
```

`react` and `react-native` are peer dependencies.

## Quick start

Wrap your app in the provider, backed by a secure store:

```tsx
import * as SecureStore from "expo-secure-store";
import {
  AuthdogProvider,
  createSecureStoreAdapter,
} from "@authdog/react-native";

const PUBLIC_KEY = process.env.EXPO_PUBLIC_PK_AUTHDOG!; // pk_…

export default function App() {
  return (
    <AuthdogProvider
      publicKey={PUBLIC_KEY}
      storage={createSecureStoreAdapter(SecureStore)}
    >
      <RootNavigator />
    </AuthdogProvider>
  );
}
```

Without a `storage` prop the provider falls back to an in-memory store — fine
for prototyping, but the token is lost on restart and is not encrypted at rest.

## Signing in (deep-linking)

Open the hosted login flow and complete it from the deep link the identity
server redirects back to:

```tsx
import { useEffect } from "react";
import { Linking } from "react-native";
import { useSignIn, useRedirectHandler, useSession } from "@authdog/react-native";

// Use a deep link your app handles. With Expo: Linking.createURL("/callback").
const REDIRECT_URL = "myapp://callback";

export function SignInScreen() {
  const { signIn } = useSignIn();
  const { handleRedirect } = useRedirectHandler();
  const { session } = useSession();

  useEffect(() => {
    // Cold start (app opened via the link).
    Linking.getInitialURL().then((url) => url && handleRedirect(url));
    // Warm start (already running).
    const sub = Linking.addEventListener("url", ({ url }) =>
      handleRedirect(url),
    );
    return () => sub.remove();
  }, [handleRedirect]);

  if (session.isAuthenticated) return <Text>Signed in 🎉</Text>;

  return <Button title="Sign in" onPress={() => signIn(REDIRECT_URL)} />;
}
```

`handleRedirect` extracts the `?token=` value, **validates it as a JWT before
persisting it**, and updates the session — a crafted deep link cannot write
arbitrary data into secure storage. Use `useSignUp().signUp(REDIRECT_URL)` for
the sign-up flow.

## Reading the user

```tsx
import { useEffect } from "react";
import { useUser } from "@authdog/react-native";

export function Profile() {
  const { user, fetchUser, isLoading } = useUser();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) return <ActivityIndicator />;
  return <Text>{JSON.stringify(user)}</Text>;
}
```

## Signing out

```tsx
const { signOut } = useSignOut();
// clears the token from state and storage; navigate as you see fit
await signOut();
```

## Permissions (UI hints only)

`useAuthz` fetches a permission list to drive UI affordances. **It is
presentational only and trivially bypassable** — never use it as an
access-control check. Enforce every protected operation server-side.

```tsx
const { fetchPermissions, hasPermission } = useAuthz({
  permissionsUrl: "https://api.example.com/permissions",
});
```

## API

| Export | Description |
| ------ | ----------- |
| `AuthdogProvider` | Context provider. Props: `publicKey`, `storage?`. |
| `useSession` | `{ session: { token, isAuthenticated }, isLoading }`. |
| `useUser` | `{ user, fetchUser, isAuthenticated, isLoading, error }`. |
| `useSignIn` / `useSignUp` | `{ signIn/​signUp(redirectUrl), isLoading, error }`. |
| `useSignOut` | `{ signOut(), isLoading, error }`. |
| `useRedirectHandler` | `{ handleRedirect(url) }` — completes login from a deep link. |
| `useAuthz` | UI-only permission helpers. |
| `createSecureStoreAdapter` | Adapts `expo-secure-store` to `AuthdogStorage`. |
| `inMemoryStorage` | Non-persistent default store. |

## License

MIT
