# @authdog/gatsby

Authdog SDK for [Gatsby](https://www.gatsbyjs.com/) — a React client provider
plus server helpers for [Gatsby Functions](https://www.gatsbyjs.com/docs/reference/functions/).

Sessions use the same `authdog-session` cookie and OIDC `userinfo` flow as every
other `@authdog/*` package, so one Authdog environment works across your stack.

## Install

```bash
bun add @authdog/gatsby @authdog/react-elements
```

Provide your public key (`pk_…`). The browser reads it via Gatsby's `GATSBY_`
prefix; Functions read it server-side:

```bash
GATSBY_AUTHDOG_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxx   # exposed to the browser
PK_AUTHDOG=pk_xxxxxxxxxxxxxxxx                   # server-only (Functions)
```

## Client

Wrap your app in `gatsby-browser.js` / `gatsby-ssr.js`:

```tsx
// gatsby-browser.js
import "@authdog/react-elements/styles.css";
import { AuthdogProvider } from "@authdog/gatsby/client";

export const wrapRootElement = ({ element }) => (
  <AuthdogProvider>{element}</AuthdogProvider>
);
```

The provider strips the `?token=…` the login redirect appends and reloads once so
the server can persist the HttpOnly session cookie.

## Server (Gatsby Functions)

```ts
// src/api/me.ts
import { createAuthdog } from "@authdog/gatsby/server";

const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });

// requireAuth is the real server-side enforcement point.
export default authdog.requireAuth(async (req, res) => {
  res.json(req.authdog.user);
});
```

```ts
// src/api/logout.ts
export { logoutHandler as default } from "@authdog/gatsby/server";
```

## API

| Export                             | Entry     | Description                                      |
| ---------------------------------- | --------- | ------------------------------------------------ |
| `AuthdogProvider`, `ReloadPage`    | `/client` | React provider + callback helper                 |
| `initAuthdog`, `clearAuthdogToken` | `/client` | Browser token bootstrap / sign-out               |
| `createAuthdog`                    | `/server` | `getSession`, `getUser`, `requireAuth`, `logout` |
| `getSessionToken`, `logoutHandler` | `/server` | Low-level helpers                                |
| `getPublicKeyPayload`              | `/server` | Validated public-key parser                      |

## License

[MIT](../../LICENSE) © Authdog
