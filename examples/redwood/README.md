# RedwoodJS App with Authdog

An example showing how the Authdog RedwoodJS SDK (`@authdog/redwood`) plugs into
a [RedwoodJS](https://redwoodjs.com/) project.

Because a full Redwood app is itself a nested `api` / `web` yarn-workspaces
monorepo driven by the Redwood CLI, this example ships the **Authdog-specific
integration points** you drop into a real Redwood project rather than a full
generated app:

```
api/src/functions/me.ts       # authenticated function (createAuthdog + requireAuth)
api/src/functions/logout.ts   # cookie-clearing logout function
web/src/App.tsx               # <AuthdogProvider> wrapping the app
web/src/pages/HomePage/       # reads the current user from the me function
redwood.toml                  # includeEnvironmentVariables for the public key
```

## Features

- API side: `createAuthdog({ publicKey }).requireAuth(...)` gates a function
- Web side: `AuthdogProvider` handles the login redirect + session cookie
- Browser sign-in against the identity host, cookie-clearing logout

## Using it in a real Redwood app

1. Create a Redwood app: `yarn create redwood-app my-app`
2. Add the SDK:

   ```bash
   yarn workspace web add @authdog/redwood @authdog/react-elements
   yarn workspace api add @authdog/redwood
   ```

3. Copy the `api/src` and `web/src` files here into your app, and add the
   `includeEnvironmentVariables` line from `redwood.toml`.
4. Provide your public key:

   ```bash
   REDWOOD_ENV_AUTHDOG_PUBLIC_KEY=pk_...   # exposed to the browser
   PK_AUTHDOG=pk_...                        # server-only (API)
   ```

5. `yarn rw dev` and open http://localhost:8910.

Type-check the integration files against the SDK from the repo root:

```bash
moon run redwood-app:type-check
```
