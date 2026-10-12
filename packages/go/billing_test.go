package authdog

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func loadBillingPin(t *testing.T) map[string]any {
	t.Helper()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	raw, err := os.ReadFile(filepath.Join(root, "specs/002-api-parity/contracts/pins/billing-plans-response.json"))
	if err != nil {
		t.Fatal(err)
	}
	var pin map[string]any
	if err := json.Unmarshal(raw, &pin); err != nil {
		t.Fatal(err)
	}
	return pin
}

func TestListBillingPlansTrustedHost(t *testing.T) {
	pin := loadBillingPin(t)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/billing/env-1/plans" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		if r.URL.Query().Get("for") != "user" {
			t.Fatalf("unexpected for=%s", r.URL.Query().Get("for"))
		}
		_ = json.NewEncoder(w).Encode(pin)
	}))
	defer srv.Close()

	client := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			req.URL.Scheme = "http"
			req.URL.Host = srv.Listener.Addr().String()
			return http.DefaultTransport.RoundTrip(req)
		}),
	}

	out, err := ListBillingPlans(context.Background(), client, "https://identity.authdog.com", "env-1", "user")
	if err != nil {
		t.Fatal(err)
	}
	plans, ok := out["plans"].([]any)
	if !ok || len(plans) == 0 {
		t.Fatalf("expected plans in response")
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func TestListBillingPlansUntrustedHost(t *testing.T) {
	_, err := ListBillingPlans(context.Background(), nil, "https://evil.example", "env-1", "user")
	if err == nil {
		t.Fatal("expected error for untrusted host")
	}
}
