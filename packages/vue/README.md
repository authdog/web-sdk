# @authdog/vue

Authdog Vue SDK for authentication and user management.

## Installation

```bash
bun add @authdog/vue
```

## Usage

### Client-side

```vue
<template>
  <div>
    <AuthdogProvider>
      <YourApp />
    </AuthdogProvider>
  </div>
</template>

<script setup lang="ts">
import { AuthdogProvider } from "@authdog/vue/client";
</script>
```

### Composables

```vue
<script setup lang="ts">
import { useSession, useUser } from "@authdog/vue";

const { session, isLoading } = useSession();
const { user } = useUser();
</script>
```

### Server-side

```typescript
import { createAuthdogServer } from "@authdog/vue/server";

const authdog = createAuthdogServer({
  publicKey: process.env.AUTHDOG_PUBLIC_KEY!,
  secretKey: process.env.AUTHDOG_SECRET_KEY!,
});
```

## API Reference

### Composables

- `useSession()` - Get current session information
- `useUser()` - Get current user information
- `useSignIn()` - Sign in functionality
- `useSignUp()` - Sign up functionality
- `useSignOut()` - Sign out functionality

### Components

- `AuthdogProvider` - Provider component for authentication context

### Server

- `createAuthdogServer()` - Create server instance
- `getSessionCookie()` - Get session cookie
- `logoutHandler()` - Handle logout
