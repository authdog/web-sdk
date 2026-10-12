package authdog

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

func billingJSONRequest(
	ctx context.Context,
	client *http.Client,
	method, rawURL string,
	headers map[string]string,
	body any,
) (map[string]any, error) {
	if client == nil {
		client = http.DefaultClient
	}

	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, rawURL, bodyReader)
	if err != nil {
		return nil, err
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	if body != nil && req.Header.Get("content-type") == "" {
		req.Header.Set("content-type", "application/json")
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var out map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		out = map[string]any{}
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		msg := fmt.Sprintf("Request failed (status %d)", resp.StatusCode)
		if meta, ok := out["meta"].(map[string]any); ok {
			if m, ok := meta["message"].(string); ok && m != "" {
				msg = m
			}
		}
		return nil, fmt.Errorf("%s", msg)
	}

	return out, nil
}

// ListBillingPlans lists publicly-visible plans for an environment. No auth required.
func ListBillingPlans(ctx context.Context, client *http.Client, identityHost, environmentID string, forResource string) (map[string]any, error) {
	safeHost, err := AssertTrustedIdentityHost(identityHost)
	if err != nil {
		return nil, err
	}
	if forResource != "org" {
		forResource = "user"
	}
	rawURL := fmt.Sprintf("%s/billing/%s/plans?for=%s",
		safeHost,
		url.PathEscape(environmentID),
		url.QueryEscape(forResource),
	)
	return billingJSONRequest(ctx, client, http.MethodGet, rawURL, nil, nil)
}

// GetBillingSubscription returns the authenticated caller's subscription.
func GetBillingSubscription(ctx context.Context, client *http.Client, identityHost, environmentID, token string) (map[string]any, error) {
	safeHost, err := AssertTrustedIdentityHost(identityHost)
	if err != nil {
		return nil, err
	}
	rawURL := fmt.Sprintf("%s/billing/%s/subscription", safeHost, url.PathEscape(environmentID))
	return billingJSONRequest(ctx, client, http.MethodGet, rawURL, map[string]string{
		"authorization": "Bearer " + token,
	}, nil)
}

// CreateBillingSubscription starts or restarts a subscription for the caller.
func CreateBillingSubscription(ctx context.Context, client *http.Client, identityHost, environmentID, token, planID, planPeriod string) (map[string]any, error) {
	safeHost, err := AssertTrustedIdentityHost(identityHost)
	if err != nil {
		return nil, err
	}
	if planPeriod == "" {
		planPeriod = "month"
	}
	rawURL := fmt.Sprintf("%s/billing/%s/subscriptions", safeHost, url.PathEscape(environmentID))
	return billingJSONRequest(ctx, client, http.MethodPost, rawURL, map[string]string{
		"authorization": "Bearer " + token,
		"content-type":  "application/json",
	}, map[string]string{"planId": planID, "planPeriod": planPeriod})
}

// CancelBillingSubscription cancels at period end for the authenticated caller.
func CancelBillingSubscription(ctx context.Context, client *http.Client, identityHost, environmentID, token string) (map[string]any, error) {
	safeHost, err := AssertTrustedIdentityHost(identityHost)
	if err != nil {
		return nil, err
	}
	rawURL := fmt.Sprintf("%s/billing/%s/subscriptions/cancel", safeHost, url.PathEscape(environmentID))
	return billingJSONRequest(ctx, client, http.MethodPost, rawURL, map[string]string{
		"authorization": "Bearer " + token,
	}, nil)
}
