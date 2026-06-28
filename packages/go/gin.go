package authdog

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// contextKey is the gin.Context key under which the resolved *Context is
// stored by AttachSession.
const contextKey = "authdog"

// AttachSession returns Gin middleware that resolves the session and stores a
// *Context in the gin.Context under the "authdog" key. It never aborts the
// request: a missing, invalid, or unverifiable token simply yields
// IsAuthenticated == false. Mount it early so downstream handlers and
// RequireAuth can read the context.
func (a *Authdog) AttachSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := GetSessionToken(c.GetHeader("Authorization"), c.GetHeader("Cookie"))

		ctx := &Context{Token: token}
		switch {
		case token == "":
			// anonymous
		case !a.fetchUser:
			// token surfaced, validation deferred to the caller
		default:
			if info, err := FetchUserData(c.Request.Context(), a.client, a.payload.IdentityHost, a.payload.EnvironmentID, token); err == nil {
				if IsAuthenticatedUserInfo(info) {
					ctx.IsAuthenticated = true
					ctx.User = info.User
					ctx.UserInfo = info
				}
			}
			// A failed/untrusted userinfo lookup is "not authenticated" — never
			// a 500 and never an authenticated session.
		}

		c.Set(contextKey, ctx)
		c.Next()
	}
}

// RequireAuth is gate middleware that aborts with 401 JSON for unauthenticated
// requests. It is the real server-side enforcement point and requires
// AttachSession to have run first.
func (a *Authdog) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ctx := FromGin(c); ctx == nil || !ctx.IsAuthenticated {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		c.Next()
	}
}

// Logout clears the session cookie and redirects to a safe, same-origin path
// taken from the redirect_uri query parameter (sanitized against open
// redirects, falling back to "/").
func (a *Authdog) Logout(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     SessionCookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   gin.Mode() == gin.ReleaseMode,
		SameSite: http.SameSiteLaxMode,
	})
	target := SanitizeRedirectPath(c.Query("redirect_uri"), "/")
	c.Redirect(http.StatusFound, target)
}

// FromGin returns the *Context attached by AttachSession, or nil if the
// middleware has not run.
func FromGin(c *gin.Context) *Context {
	if v, ok := c.Get(contextKey); ok {
		if ctx, ok := v.(*Context); ok {
			return ctx
		}
	}
	return nil
}
