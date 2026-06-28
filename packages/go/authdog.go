// Package authdog is the Authdog SDK for Go web backends, with first-class
// middleware for the Gin framework (see gin.go).
//
// It mirrors the TypeScript @authdog/express / @authdog/fastify SDKs on the
// wire — same authdog-session cookie, same OIDC userinfo flow, and the same
// trusted identity-host allowlist — so one Authdog environment serves Node and
// Go services interchangeably.
package authdog

import (
	"errors"
	"net/http"
)

// Config configures a new Authdog instance.
type Config struct {
	// PublicKey is the Authdog public key (pk_…). Required.
	PublicKey string
	// FetchUser controls whether AttachSession performs a userinfo round-trip.
	// Defaults to true. When false, the token is surfaced but IsAuthenticated
	// stays false and the caller is responsible for validating it.
	FetchUser *bool
	// HTTPClient is used for userinfo requests. Defaults to http.DefaultClient.
	HTTPClient *http.Client
}

// Authdog is a configured server instance. The public key is validated and
// parsed once in New — enforcing the trusted identity-host allowlist — so a
// malformed or untrusted key fails fast at startup rather than per request.
type Authdog struct {
	payload   *PublicKeyPayload
	fetchUser bool
	client    *http.Client
}

// New validates the public key and returns an Authdog instance.
func New(cfg Config) (*Authdog, error) {
	if cfg.PublicKey == "" {
		return nil, errors.New("public key is not defined")
	}
	payload, err := ValidateAndParsePublicKey(cfg.PublicKey)
	if err != nil {
		return nil, err
	}
	fetchUser := true
	if cfg.FetchUser != nil {
		fetchUser = *cfg.FetchUser
	}
	client := cfg.HTTPClient
	if client == nil {
		client = http.DefaultClient
	}
	return &Authdog{payload: payload, fetchUser: fetchUser, client: client}, nil
}

// PublicKeyPayload returns the validated, parsed public-key payload.
func (a *Authdog) PublicKeyPayload() PublicKeyPayload { return *a.payload }

// Context is the per-request authentication context resolved by AttachSession.
type Context struct {
	Token           string
	User            any
	IsAuthenticated bool
	UserInfo        *UserInfoResponse
}
