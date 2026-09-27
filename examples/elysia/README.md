# Authdog × Elysia example

Runnable sample for [`@authdog/elysia`](../../packages/elysia).

Set `PK_AUTHDOG` and start it from the repository root:

```bash
cp examples/elysia/.env.example examples/elysia/.env
moon run elysia-api:dev
```

The server listens on http://localhost:3014.

Elysia 1.4 peers `@sinclair/typebox` 0.34. This repo also has older TypeBox copies for other tools, so the root `package.json` override `elysia>@sinclair/typebox` keeps this sample on 0.34.

| Route | Auth | Description |
| ----- | ---- | ----------- |
| `GET /` | public | Reports whether you are signed in |
| `GET /api/public` | public | Returns `{ authenticated: boolean }` |
| `GET /me` | protected | Returns the user, or refuses anonymous access |
| `GET /protected` | protected | Returns a message for a signed-in session |
| `GET /logout` | public | Clears the session and stays on a safe path |
