//! Identity-host billing API (plans and subscriptions).

use serde_json::{Map, Value};

use crate::public_key::{assert_trusted_identity_host, PublicKeyError};

#[derive(Debug, thiserror::Error)]
pub enum BillingError {
    #[error(transparent)]
    PublicKey(#[from] PublicKeyError),
    #[error("{0}")]
    Request(String),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
}

async fn json_request(
    client: &reqwest::Client,
    method: reqwest::Method,
    url: &str,
    token: Option<&str>,
    body: Option<Value>,
) -> Result<Map<String, Value>, BillingError> {
    let mut req = client.request(method, url);
    if let Some(t) = token {
        req = req.header("authorization", format!("Bearer {t}"));
    }
    if let Some(b) = body {
        req = req.json(&b);
    }

    let response = req.send().await?;
    let status = response.status();
    let value: Value = response.json().await.unwrap_or(Value::Object(Map::new()));

    if !status.is_success() {
        let message = value
            .get("meta")
            .and_then(|m| m.get("message"))
            .and_then(|m| m.as_str())
            .map(str::to_string)
            .unwrap_or_else(|| format!("Request failed (status {status})"));
        return Err(BillingError::Request(message));
    }

    match value {
        Value::Object(map) => Ok(map),
        _ => Ok(Map::new()),
    }
}

fn billing_env_path(environment_id: &str) -> String {
    utf8_percent_encode_path(environment_id)
}

fn utf8_percent_encode_path(segment: &str) -> String {
    let mut out = String::with_capacity(segment.len());
    for b in segment.bytes() {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.' | b'~') {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

/// List publicly-visible plans for an environment. No auth required.
pub async fn list_billing_plans(
    client: &reqwest::Client,
    identity_host: &str,
    environment_id: &str,
    for_resource: &str,
) -> Result<Map<String, Value>, BillingError> {
    let safe_host = assert_trusted_identity_host(identity_host)?;
    let for_param = if for_resource == "org" { "org" } else { "user" };
    let env = billing_env_path(environment_id);
    let url = format!("{safe_host}/billing/{env}/plans?for={for_param}");
    json_request(client, reqwest::Method::GET, &url, None, None).await
}

/// The authenticated caller's current subscription.
pub async fn get_billing_subscription(
    client: &reqwest::Client,
    identity_host: &str,
    environment_id: &str,
    token: &str,
) -> Result<Map<String, Value>, BillingError> {
    let safe_host = assert_trusted_identity_host(identity_host)?;
    let env = billing_env_path(environment_id);
    let url = format!("{safe_host}/billing/{env}/subscription");
    json_request(client, reqwest::Method::GET, &url, Some(token), None).await
}

/// Start or restart a subscription; returns Stripe client secret when applicable.
pub async fn create_billing_subscription(
    client: &reqwest::Client,
    identity_host: &str,
    environment_id: &str,
    token: &str,
    plan_id: &str,
    plan_period: &str,
) -> Result<Map<String, Value>, BillingError> {
    let safe_host = assert_trusted_identity_host(identity_host)?;
    let env = billing_env_path(environment_id);
    let url = format!("{safe_host}/billing/{env}/subscriptions");
    let period = if plan_period.is_empty() {
        "month"
    } else {
        plan_period
    };
    let body = serde_json::json!({
        "planId": plan_id,
        "planPeriod": period,
    });
    json_request(
        client,
        reqwest::Method::POST,
        &url,
        Some(token),
        Some(body),
    )
    .await
}

/// Cancel the caller's subscription at period end.
pub async fn cancel_billing_subscription(
    client: &reqwest::Client,
    identity_host: &str,
    environment_id: &str,
    token: &str,
) -> Result<Map<String, Value>, BillingError> {
    let safe_host = assert_trusted_identity_host(identity_host)?;
    let env = billing_env_path(environment_id);
    let url = format!("{safe_host}/billing/{env}/subscriptions/cancel");
    json_request(client, reqwest::Method::POST, &url, Some(token), None).await
}

#[cfg(test)]
mod tests {
    use crate::public_key::assert_trusted_identity_host;

    #[test]
    fn untrusted_host_rejects_before_http() {
        assert!(assert_trusted_identity_host("https://evil.example").is_err());
    }
}
