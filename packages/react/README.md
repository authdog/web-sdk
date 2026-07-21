# `@authdog/react`

Framework-agnostic Authdog React SDK: provider, session hooks, sign-in buttons, and Account UI.

## Install

```bash
bun add @authdog/react @authdog/react-elements
```

```tsx
import "@authdog/react-elements/styles.css"
import {
  AuthdogProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  AccountButton,
} from "@authdog/react"

export function App({ children }) {
  return (
    <AuthdogProvider publicKey={import.meta.env.VITE_AUTHDOG_PK}>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <AccountButton />
        {children}
      </SignedIn>
    </AuthdogProvider>
  )
}
```

`AccountButton` opens the Account shell (Profile / MFA / Sessions / Groups / Tokens). Pass data and callbacks via `accountProps` when you wire host APIs.
