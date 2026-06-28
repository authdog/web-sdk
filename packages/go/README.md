# authdog (Go)

Authdog SDK for Go web backends, with first-class [Gin](https://gin-gonic.com)
middleware — session resolution, an authentication gate, and a logout handler.
It mirrors the TypeScript [`@authdog/express`](../express) /
[`@authdog/fastify`](../fastify) SDKs on the wire (same `authdog-session`
cookie, same OIDC `userinfo` flow, same trusted identity-host allowlist), so a
single Authdog environment serves Node and Go services interchangeably.

## Install

```bash
go get github.com/authdog/web-sdk/packages/go@latest
```

```go
import authdog "github.com/authdog/web-sdk/packages/go"
```

## Quick start

```go
package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	authdog "github.com/authdog/web-sdk/packages/go"
)

func main() {
	// Validated + parsed once at startup — a malformed/untrusted key errors here.
	ad, err := authdog.New(authdog.Config{PublicKey: os.Getenv("PK_AUTHDOG")})
	if err != nil {
		panic(err)
	}

	r := gin.Default()

	// Resolve the session for every request; attaches *authdog.Context.
	r.Use(ad.AttachSession())

	// Public route.
	r.GET("/", func(c *gin.Context) {
		ctx := authdog.FromGin(c)
		c.JSON(http.StatusOK, gin.H{"authenticated": ctx != nil && ctx.IsAuthenticated})
	})

	// Protected route — RequireAuth is the real server-side enforcement point.
	r.GET("/me", ad.RequireAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, authdog.FromGin(c).User)
	})

	// Clears the session cookie and redirects to a sanitized redirect_uri.
	r.GET("/logout", ad.Logout)

	_ = r.Run(":3000")
}
```

## How it works

- **`AttachSession()`** — reads the token from the `authdog-session` cookie or
  an `Authorization: Bearer <token>` header, calls the identity provider's
  `userinfo` endpoint, and stores an `*authdog.Context` on the `gin.Context`
  (read it with `authdog.FromGin(c)`):

  ```go
  type Context struct {
      Token           string
      User            any
      IsAuthenticated bool
      UserInfo        *UserInfoResponse
  }
  ```

  It **never aborts** the request — a missing, invalid, or unverifiable token
  yields `IsAuthenticated == false`. Mount it once, early.

- **`RequireAuth()`** — aborts with `401 {"error":"Unauthorized"}` when the
  request is not authenticated. **This is the security boundary**; every
  protected route must sit behind it (after `AttachSession`).

- **`Logout`** — expires the `authdog-session` cookie (`HttpOnly`,
  `SameSite=Lax`, `Secure` in `gin.ReleaseMode`) and redirects to the
  `redirect_uri` query parameter after `SanitizeRedirectPath` strips open
  redirects.

### Skip the userinfo round-trip

```go
no := false
ad, _ := authdog.New(authdog.Config{PublicKey: pk, FetchUser: &no})
```

`Context.Token` is populated but `IsAuthenticated` stays false — you own
validation. Use a custom `*http.Client` via `Config.HTTPClient`.

### Using another router

The core (`ValidateAndParsePublicKey`, `GetSessionToken`, `FetchUserData`,
`IsAuthenticatedUserInfo`, `SanitizeRedirectPath`) is framework-agnostic — wire
it into `net/http`, chi, or Echo if you are not using Gin.

## Security

- The public key is validated and parsed **once at startup**; an untrusted key
  (identity host not on the allowlist) errors immediately.
- The bearer token is only ever sent to a trusted, `https:` identity host.
  Self-hosted hosts can be allowlisted via `AUTHDOG_ALLOWED_IDENTITY_HOSTS`
  (comma-separated).
- A request is authenticated **only** when the `userinfo` envelope reports
  success (`meta.code == 200` with a `user`).

## Development

```bash
cd packages/go
go test ./...        # or:  moon run go:test
```

## License

MIT
