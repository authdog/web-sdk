package authdog

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"
)

// PublicKeyPayload is the decoded contents of an Authdog public key (pk_…).
type PublicKeyPayload struct {
	EnvironmentID string `json:"environmentId"`
	IdentityHost  string `json:"identityHost"`
	Version       string `json:"version,omitempty"`
	Region        string `json:"region,omitempty"`
}

// defaultAllowedHostSuffixes are the hosts the SDK is allowed to send the
// bearer token to. The identity host is decoded from the (potentially
// attacker-influenced) public key, so it MUST be validated against this
// allowlist before it is ever used as a request target — otherwise a crafted
// pk_ could point the SDK (and the token) at an internal address (SSRF) or an
// attacker-controlled server (token exfiltration).
var defaultAllowedHostSuffixes = []string{"authdog.com", "authdog.xyz"}

func isPrivateOrLoopbackHost(hostname string) bool {
	h := strings.ToLower(strings.Trim(hostname, "[]"))
	if h == "localhost" || strings.HasSuffix(h, ".localhost") {
		return true
	}
	if ip := net.ParseIP(h); ip != nil {
		return ip.IsLoopback() ||
			ip.IsPrivate() ||
			ip.IsLinkLocalUnicast() ||
			ip.IsLinkLocalMulticast() ||
			ip.IsUnspecified()
	}
	return false
}

func allowedHostSuffixes() []string {
	suffixes := append([]string{}, defaultAllowedHostSuffixes...)
	for _, s := range strings.Split(os.Getenv("AUTHDOG_ALLOWED_IDENTITY_HOSTS"), ",") {
		if trimmed := strings.ToLower(strings.TrimSpace(s)); trimmed != "" {
			suffixes = append(suffixes, trimmed)
		}
	}
	return suffixes
}

// AssertTrustedIdentityHost validates that identityHost is safe to send
// credentials to: a well-formed https URL whose hostname is on the allowlist
// and is not a private/loopback address. It returns the host with trailing
// slashes stripped, or an error.
func AssertTrustedIdentityHost(identityHost string) (string, error) {
	u, err := url.Parse(identityHost)
	if err != nil || u.Hostname() == "" {
		return "", errors.New("invalid identity host")
	}
	if u.Scheme != "https" {
		return "", errors.New("identity host must use https")
	}

	hostname := strings.ToLower(u.Hostname())
	if isPrivateOrLoopbackHost(hostname) {
		return "", errors.New("untrusted identity host")
	}

	allowed := false
	for _, suffix := range allowedHostSuffixes() {
		if hostname == suffix || strings.HasSuffix(hostname, "."+suffix) {
			allowed = true
			break
		}
	}
	if !allowed {
		return "", errors.New("untrusted identity host")
	}

	return strings.TrimRight(identityHost, "/"), nil
}

// ValidateAndParsePublicKey decodes and fully validates an Authdog public key
// (pk_…). This is the single source of truth for parsing public keys in Go.
func ValidateAndParsePublicKey(publicKey string) (*PublicKeyPayload, error) {
	if publicKey == "" {
		return nil, errors.New("public key is not defined")
	}
	if !strings.HasPrefix(publicKey, "pk_") {
		return nil, errors.New("invalid public key")
	}

	raw := strings.TrimPrefix(publicKey, "pk_")
	// Tolerate both standard and unpadded base64.
	decoded, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		if decoded, err = base64.RawStdEncoding.DecodeString(raw); err != nil {
			return nil, fmt.Errorf("failed to parse public key: %w", err)
		}
	}

	var payload PublicKeyPayload
	if err := json.Unmarshal(decoded, &payload); err != nil {
		return nil, fmt.Errorf("failed to parse public key: %w", err)
	}

	if payload.EnvironmentID == "" {
		return nil, errors.New("invalid public key: missing environmentId")
	}
	if payload.IdentityHost == "" {
		return nil, errors.New("invalid public key: missing identityHost")
	}

	safeHost, err := AssertTrustedIdentityHost(payload.IdentityHost)
	if err != nil {
		return nil, err
	}
	payload.IdentityHost = safeHost

	return &payload, nil
}
