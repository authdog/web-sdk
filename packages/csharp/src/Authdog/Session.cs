using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Authdog;

public static class Cookies
{
    public const string SessionCookieName = "authdog-session";

    public static Dictionary<string, string> Parse(string? cookieHeader)
    {
        var cookies = new Dictionary<string, string>(StringComparer.Ordinal);
        if (string.IsNullOrEmpty(cookieHeader))
        {
            return cookies;
        }

        foreach (var part in cookieHeader.Split(';'))
        {
            var trimmed = part.Trim();
            var idx = trimmed.IndexOf('=');
            if (idx <= 0)
            {
                continue;
            }

            var name = trimmed[..idx].Trim();
            if (name.Length == 0)
            {
                continue;
            }

            var raw = trimmed[(idx + 1)..].Trim();
            cookies[name] = Uri.UnescapeDataString(raw);
        }

        return cookies;
    }

    public static string? SessionToken(string? authorization, string? cookieHeader)
    {
        if (!string.IsNullOrEmpty(authorization) &&
            authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authorization[7..].Trim();
            if (token.Length > 0)
            {
                return token;
            }
        }

        Parse(cookieHeader).TryGetValue(SessionCookieName, out var cookie);
        return cookie;
    }
}

public static class Redirects
{
    public static string Sanitize(object? target, string fallback = "/")
    {
        if (target is not string value || value.Length == 0)
        {
            return fallback;
        }

        if (!value.StartsWith('/') || value.StartsWith("//", StringComparison.Ordinal) || value.StartsWith("/\\", StringComparison.Ordinal))
        {
            return fallback;
        }

        if (value.Any(c => c == '\\' || c < 0x20 || c == 0x7f))
        {
            return fallback;
        }

        if (Regex.IsMatch(value, @"^[a-z][a-z0-9+.-]*:", RegexOptions.IgnoreCase))
        {
            return fallback;
        }

        return value;
    }

    public static string ExpiredSessionCookie(bool production)
    {
        var secure = production ? " Secure;" : "";
        return $"{Cookies.SessionCookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;{secure} SameSite=Lax";
    }

    public static bool IsProduction()
    {
        foreach (var key in new[] { "NODE_ENV", "ENV", "ASPNETCORE_ENVIRONMENT" })
        {
            var value = Environment.GetEnvironmentVariable(key);
            if (string.Equals(value, "production", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(value, "Production", StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }
}

public sealed record AuthdogContext(string? Token, JsonElement? User, bool Authenticated, JsonDocument? UserInfo)
{
    public static AuthdogContext Anonymous() => new(null, null, false, null);
}

public sealed record Gate(bool Authenticated, AuthdogContext Context, int Status, string? Body);

public sealed record Logout(string Location, string SetCookie);

public delegate string UserInfoFetcher(string url, string bearerToken);

public sealed class AuthdogClient
{
    private readonly PublicKeyPayload _payload;
    private readonly bool _fetchUser;
    private readonly UserInfoFetcher _fetcher;

    public AuthdogClient(string publicKey, bool fetchUser = true, UserInfoFetcher? fetcher = null)
    {
        if (string.IsNullOrEmpty(publicKey))
        {
            throw new PublicKeyException("Public key is not defined");
        }

        _payload = PublicKey.ValidateAndParse(publicKey);
        _fetchUser = fetchUser;
        _fetcher = fetcher ?? DefaultFetch;
    }

    public PublicKeyPayload Payload => _payload;

    public AuthdogContext Resolve(string? authorization, string? cookieHeader)
    {
        var token = Cookies.SessionToken(authorization, cookieHeader);
        if (token is null)
        {
            return AuthdogContext.Anonymous();
        }

        if (!_fetchUser)
        {
            return new AuthdogContext(token, null, false, null);
        }

        try
        {
            var url = $"{_payload.IdentityHost}/oidc/{Uri.EscapeDataString(_payload.EnvironmentId)}/userinfo";
            PublicKey.AssertTrustedIdentityHost(_payload.IdentityHost);
            var body = _fetcher(url, token);
            var doc = JsonDocument.Parse(body);
            if (!IsAuthenticated(doc.RootElement))
            {
                return new AuthdogContext(token, null, false, doc);
            }

            var user = doc.RootElement.GetProperty("user");
            return new AuthdogContext(token, user, true, doc);
        }
        catch
        {
            return new AuthdogContext(token, null, false, null);
        }
    }

    public Gate RequireAuth(string? authorization, string? cookieHeader)
    {
        var context = Resolve(authorization, cookieHeader);
        if (!context.Authenticated)
        {
            return new Gate(false, context, 401, "{\"error\":\"Unauthorized\"}");
        }

        return new Gate(true, context, 200, null);
    }

    public Logout Logout(string? redirectUri) =>
        new(Redirects.Sanitize(redirectUri, "/"), Redirects.ExpiredSessionCookie(Redirects.IsProduction()));

    private static bool IsAuthenticated(JsonElement data)
    {
        if (data.ValueKind != JsonValueKind.Object ||
            !data.TryGetProperty("meta", out var meta) ||
            meta.ValueKind != JsonValueKind.Object ||
            !meta.TryGetProperty("code", out var code) ||
            code.ValueKind != JsonValueKind.Number ||
            code.GetInt32() != 200)
        {
            return false;
        }

        return data.TryGetProperty("user", out var user) && user.ValueKind is not JsonValueKind.Null and not JsonValueKind.Undefined;
    }

    private static string DefaultFetch(string url, string bearerToken)
    {
        var uri = new Uri(url);
        PublicKey.AssertTrustedIdentityHost($"{uri.Scheme}://{uri.Host}");
        using var client = new HttpClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, uri);
        request.Headers.TryAddWithoutValidation("Authorization", "Bearer " + bearerToken);
        using var response = client.Send(request);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"failed to fetch user info (status {(int)response.StatusCode})");
        }

        return response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
    }
}
