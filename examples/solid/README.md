# Authdog × Solid example

Solid provider with sign-in, profile, and sign-out. The public key is the only credential.

```bash
cp examples/solid/.env.example examples/solid/.env
moon run solid-app:dev
```

Listens on http://localhost:3004. Configure it with `PK_AUTHDOG` only.
