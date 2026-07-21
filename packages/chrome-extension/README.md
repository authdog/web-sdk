# @authdog/chrome-extension

Authdog authentication for Chrome extensions. The SDK provides a React
provider, session and user hooks, sign-in components, `chrome.storage.local`
session persistence, and an interactive `chrome.identity` login flow.

## Install

```bash
pnpm add @authdog/chrome-extension
```

`react` is a peer dependency. Your extension must use Manifest V3 and request
the `identity` and `storage` permissions.

## Plasmo quickstart

Add your Authdog public key to `.env.development`:

```env
PLASMO_PUBLIC_AUTHDOG_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxx
```

Configure the required extension permissions in `package.json`. Replace the
identity host with the host encoded in your Authdog public key:

```json
{
  "manifest": {
    "permissions": ["identity", "storage"],
    "host_permissions": ["https://identity.authdog.com/*"]
  }
}
```

Wrap the popup in `AuthdogProvider`:

```tsx
import {
  AuthdogProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useSignOut,
  useUser,
} from "@authdog/chrome-extension";

const publicKey = process.env.PLASMO_PUBLIC_AUTHDOG_PUBLIC_KEY;

if (!publicKey) {
  throw new Error("Missing PLASMO_PUBLIC_AUTHDOG_PUBLIC_KEY");
}

function Account() {
  const { user, isLoading } = useUser();
  const { signOut } = useSignOut();

  if (isLoading) return <p>Loading…</p>;
  return (
    <>
      <p>Welcome, {user?.displayName ?? user?.userName}</p>
      <button onClick={() => void signOut()}>Sign out</button>
    </>
  );
}

export default function Popup() {
  return (
    <AuthdogProvider publicKey={publicKey}>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <Account />
      </SignedIn>
    </AuthdogProvider>
  );
}
```

## Configure the callback URL

Authentication runs through `chrome.identity.launchWebAuthFlow()`. Add this
extension callback URL to your Authdog application's allowed redirect URLs:

```text
https://<EXTENSION_ID>.chromiumapp.org/authdog
```

You can inspect the exact value at runtime with `getAuthRedirectUrl()`. Keep the
extension ID stable between builds by setting a manifest `key`; otherwise the
callback URL changes when the ID changes.

## API

| Export                          | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `AuthdogProvider`               | Loads and persists the current session.           |
| `SignedIn` / `SignedOut`        | Render children for the current auth state.       |
| `SignInButton` / `SignUpButton` | Unstyled buttons that launch hosted auth.         |
| `useSession`                    | Returns the token and authentication state.       |
| `useUser`                       | Loads the current user from OIDC `userinfo`.      |
| `useSignIn` / `useSignUp`       | Programmatically launch hosted auth.              |
| `useSignOut`                    | Clears the stored session.                        |
| `createChromeStorage`           | `chrome.storage.local` adapter.                   |
| `getAuthRedirectUrl`            | Returns the extension's stable auth callback URL. |

Authorization must still be enforced by your backend. Extension state and UI
checks are controlled by the user and are not security boundaries.

## License

MIT
