# Authdog × Hono example

Runnable sample for [`@authdog/hono`](../../packages/hono).

Set `PK_AUTHDOG` and start it from the repository root:

```bash
cp examples/hono/.env.example examples/hono/.env
moon run hono-api:dev
```

The server listens on http://localhost:3012.

| Route | Auth | Description |
| ----- | ---- | ----------- |
| `GET /` | public | Reports whether you are signed in |
| `GET /api/public` | public | Returns `{ authenticated: boolean }` |
| `GET /me` | protected | Returns the user, or refuses anonymous access |
| `GET /protected` | protected | Returns a message for a signed-in session |
| `GET /logout` | public | Clears the session and stays on a safe path |
