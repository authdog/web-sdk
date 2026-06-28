package authdog

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func makePK(t *testing.T, payload map[string]any) string {
	t.Helper()
	b, err := json.Marshal(payload)
	if err != nil {
		t.Fatal(err)
	}
	return "pk_" + base64.StdEncoding.EncodeToString(b)
}

func TestValidateAndParsePublicKey(t *testing.T) {
	pk := makePK(t, map[string]any{"environmentId": "env_1", "identityHost": "https://id.authdog.com/"})
	payload, err := ValidateAndParsePublicKey(pk)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if payload.EnvironmentID != "env_1" {
		t.Errorf("environmentId = %q", payload.EnvironmentID)
	}
	if payload.IdentityHost != "https://id.authdog.com" {
		t.Errorf("identityHost not trimmed: %q", payload.IdentityHost)
	}
}

func TestValidateAndParsePublicKeyRejects(t *testing.T) {
	cases := []string{
		"",
		"sk_abc",
		"pk_not-base64-!!",
		makePK(t, map[string]any{"identityHost": "https://id.authdog.com"}),
	}
	for _, pk := range cases {
		if _, err := ValidateAndParsePublicKey(pk); err == nil {
			t.Errorf("expected error for %q", pk)
		}
	}
}

func TestAssertTrustedIdentityHost(t *testing.T) {
	bad := []string{
		"http://id.authdog.com",
		"https://id.evil.com",
		"https://localhost",
		"https://127.0.0.1",
		"https://169.254.169.254",
		"https://10.0.0.5",
		"https://authdog.com.evil.com",
	}
	for _, h := range bad {
		if _, err := AssertTrustedIdentityHost(h); err == nil {
			t.Errorf("expected %q to be rejected", h)
		}
	}
	for _, h := range []string{"https://authdog.com", "https://id.authdog.xyz"} {
		if _, err := AssertTrustedIdentityHost(h); err != nil {
			t.Errorf("expected %q to be allowed: %v", h, err)
		}
	}
}

func TestParseCookies(t *testing.T) {
	c := ParseCookies("authdog-session=ab=cd==; other=1")
	if c["authdog-session"] != "ab=cd==" {
		t.Errorf("value with = corrupted: %q", c["authdog-session"])
	}
	if c["other"] != "1" {
		t.Errorf("other = %q", c["other"])
	}
}

func TestGetSessionToken(t *testing.T) {
	if got := GetSessionToken("Bearer abc", "authdog-session=cookie"); got != "abc" {
		t.Errorf("bearer not preferred: %q", got)
	}
	if got := GetSessionToken("", "authdog-session=cookie"); got != "cookie" {
		t.Errorf("cookie fallback: %q", got)
	}
	if got := GetSessionToken("", "other=1"); got != "" {
		t.Errorf("expected empty, got %q", got)
	}
}

func TestSanitizeRedirectPath(t *testing.T) {
	cases := map[string]string{
		"/dashboard":          "/dashboard",
		"//evil.com":          "/",
		"/\\evil.com":         "/",
		"https://evil.com":    "/",
		"javascript:alert(1)": "/",
		"":                    "/",
	}
	for in, want := range cases {
		if got := SanitizeRedirectPath(in, "/"); got != want {
			t.Errorf("SanitizeRedirectPath(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestGinIntegration(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Fake identity server posing as an allowlisted host is not possible; test
	// the middleware wiring with FetchUser disabled + a manual context instead.
	pk := makePK(t, map[string]any{"environmentId": "env_1", "identityHost": "https://id.authdog.com"})
	a, err := New(Config{PublicKey: pk})
	if err != nil {
		t.Fatal(err)
	}

	r := gin.New()
	r.Use(func(c *gin.Context) {
		// Simulate AttachSession having authenticated the request.
		c.Set(contextKey, &Context{Token: "t", IsAuthenticated: true, User: map[string]any{"id": "u1"}})
		c.Next()
	})
	r.GET("/me", a.RequireAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, FromGin(c).User)
	})
	r.GET("/logout", a.Logout)

	// Authenticated request passes the gate.
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/me", nil))
	if w.Code != http.StatusOK {
		t.Errorf("authenticated /me = %d", w.Code)
	}

	// Logout redirects and clears the cookie.
	w = httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/logout?redirect_uri=/bye", nil))
	if w.Code != http.StatusFound || w.Header().Get("Location") != "/bye" {
		t.Errorf("logout = %d %q", w.Code, w.Header().Get("Location"))
	}
}

func TestRequireAuthBlocksAnonymous(t *testing.T) {
	gin.SetMode(gin.TestMode)
	pk := makePK(t, map[string]any{"environmentId": "env_1", "identityHost": "https://id.authdog.com"})
	a, _ := New(Config{PublicKey: pk})

	r := gin.New()
	r.Use(a.AttachSession())
	r.GET("/me", a.RequireAuth(), func(c *gin.Context) { c.Status(http.StatusOK) })

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/me", nil))
	if w.Code != http.StatusUnauthorized {
		t.Errorf("anonymous /me = %d, want 401", w.Code)
	}
}
