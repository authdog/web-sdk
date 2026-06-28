package authdog

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

// UserInfoResponse is the decoded OIDC userinfo envelope. Raw is the full
// decoded JSON object so callers can read provider-specific fields.
type UserInfoResponse struct {
	User any            `json:"user"`
	Meta map[string]any `json:"meta"`
	Raw  map[string]any `json:"-"`
}

// FetchUserData fetches user data from the identity host's OIDC userinfo
// endpoint. identityHost is re-validated against the trusted-host allowlist
// before the bearer token is sent, preventing SSRF / token exfiltration via a
// crafted public key. Callers MUST still check IsAuthenticatedUserInfo.
func FetchUserData(ctx context.Context, client *http.Client, identityHost, environmentID, token string) (*UserInfoResponse, error) {
	safeHost, err := AssertTrustedIdentityHost(identityHost)
	if err != nil {
		return nil, err
	}
	if client == nil {
		client = http.DefaultClient
	}

	endpoint := fmt.Sprintf("%s/oidc/%s/userinfo", safeHost, url.PathEscape(environmentID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch user info (status %d)", resp.StatusCode)
	}

	var raw map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	out := &UserInfoResponse{Raw: raw, User: raw["user"]}
	if meta, ok := raw["meta"].(map[string]any); ok {
		out.Meta = meta
	}
	return out, nil
}

// IsAuthenticatedUserInfo reports true only when the userinfo envelope
// represents a genuinely authenticated user (meta.code == 200 with a user).
func IsAuthenticatedUserInfo(data *UserInfoResponse) bool {
	if data == nil || data.User == nil {
		return false
	}
	code, ok := data.Meta["code"]
	if !ok {
		return false
	}
	// JSON numbers decode to float64.
	if f, ok := code.(float64); ok {
		return f == 200
	}
	return false
}
