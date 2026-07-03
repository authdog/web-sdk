# @authdog/redwood

Authdog SDK for [RedwoodJS](https://redwoodjs.com/) — a React web-side provider
plus API-side helpers for Redwood functions and services.

Sessions use the same `authdog-session` cookie and OIDC `userinfo` flow as every
other `@authdog/*` package, so one Authdog environment works across your stack.

## Install

```bash
yarn workspace web add @authdog/redwood @authdog/react-elements
yarn workspace api add @authdog/redwood
```

Provide your public key (`pk_…`). The web side reads it via Redwood's
`REDWOOD_ENV_` prefix; the API side reads it server-side:

```bash
REDWOOD_ENV_AUTHDOG_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxx   # exposed to the browser
PK_AUTHDOG=pk_xxxxxxxxxxxxxxxx                        # server-only (API)
```

> Add `AUTHDOG_PUBLIC_KEY` (or the `REDWOOD_ENV_*` name) to
> `includeEnvironmentVariables` in `redwood.toml` so the web build inlines it.

## Web side

Wrap your app in `web/src/App.tsx`:

```tsx
import "@authdog/react-elements/styles.css";
import { AuthdogProvider } from "@authdog/redwood/web";

const App = () => (
  <AuthdogProvider>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <Routes />
    </RedwoodProvider>
  </AuthdogProvider>
);
```

The provider strips the `?token=…` the login redirect appends and reloads once so
the server can persist the HttpOnly session cookie.

## API side (functions)

```ts
// api/src/functions/me.ts
import { createAuthdog } from "@authdog/redwood/api";

const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });

// requireAuth is the real server-side enforcement point.
export const handler = authdog.requireAuth(async (event) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(event.authdog.user),
}));
```

```ts
// api/src/functions/logout.ts
export { logoutHandler as handler } from "@authdog/redwood/api";
```

Inside a Redwood **service** you can resolve the user from the incoming event:

```ts
import { createAuthdog } from "@authdog/redwood/api";
import { context } from "@redwoodjs/graphql-server";

const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });

export const me = async () => {
  const user = await authdog.getUser(context.event);
  return user?.user ?? null;
};
```

## API

| Export                             | Entry  | Description                                      |
| ---------------------------------- | ------ | ------------------------------------------------ |
| `AuthdogProvider`, `ReloadPage`    | `/web` | React provider + callback helper                 |
| `initAuthdog`, `clearAuthdogToken` | `/web` | Browser token bootstrap / sign-out               |
| `createAuthdog`                    | `/api` | `getSession`, `getUser`, `requireAuth`, `logout` |
| `getSessionToken`, `logoutHandler` | `/api` | Low-level helpers                                |
| `getPublicKeyPayload`              | `/api` | Validated public-key parser                      |

## License

[MIT](../../LICENSE) © Authdog
