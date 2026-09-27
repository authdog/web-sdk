# Authdog × React Router example

Runnable sample for [`@authdog/react-router`](../../packages/react-router).

Set `PK_AUTHDOG` and start it from the repository root:

```bash
cp examples/react-router/.env.example examples/react-router/.env
moon run react-router-app:dev
```

The server listens on http://localhost:3002.

| Route | Auth | Description |
| ----- | ---- | ----------- |
| `GET /` | public | Reports whether you are signed in |
| `GET /api/public` | public | Returns `{ authenticated: boolean }` |
| `GET /me` | protected | Returns the user, or refuses anonymous access |
| `GET /protected` | protected | Returns a message for a signed-in session |
| `GET /logout` | public | Clears the session and stays on a safe path |
