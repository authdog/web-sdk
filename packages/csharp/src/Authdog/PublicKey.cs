using System.Text;
using System.Text.Json;

namespace Authdog;

public sealed class PublicKeyException(string message) : ArgumentException(message);

public sealed record PublicKeyPayload(string EnvironmentId, string IdentityHost);

public static class PublicKey
{
    private static readonly string[] DefaultSuffixes = ["authdog.com", "authdog.xyz"];

    public static string AssertTrustedIdentityHost(string identityHost, string? extraHosts = null)
    {
        extraHosts ??= Environment.GetEnvironmentVariable("AUTHDOG_ALLOWED_IDENTITY_HOSTS");
        if (!Uri.TryCreate(identityHost, UriKind.Absolute, out var uri) || string.IsNullOrEmpty(uri.Host))
        {
            throw new PublicKeyException("Invalid identity host");
        }

        if (!string.Equals(uri.Scheme, "https", StringComparison.OrdinalIgnoreCase))
        {
            throw new PublicKeyException("Identity host must use https");
        }

        var hostname = uri.Host.ToLowerInvariant();
        if (IsPrivateOrLoopback(hostname))
        {
            throw new PublicKeyException("Untrusted identity host");
        }

        var allowed = Suffixes(extraHosts).Any(suffix =>
            hostname == suffix || hostname.EndsWith("." + suffix, StringComparison.Ordinal));
        if (!allowed)
        {
            throw new PublicKeyException("Untrusted identity host");
        }

        return identityHost.TrimEnd('/');
    }

    public static PublicKeyPayload ValidateAndParse(string publicKey, string? extraHosts = null)
    {
        if (string.IsNullOrEmpty(publicKey))
        {
            throw new PublicKeyException("Public key is not defined");
        }

        if (!publicKey.StartsWith("pk_", StringComparison.Ordinal))
        {
            throw new PublicKeyException("Invalid public key");
        }

        try
        {
            var raw = publicKey[3..];
            var padded = raw + new string('=', (4 - raw.Length % 4) % 4);
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(padded));
            using var doc = JsonDocument.Parse(decoded);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                throw new PublicKeyException("Invalid public key payload");
            }

            if (!doc.RootElement.TryGetProperty("environmentId", out var envEl) || envEl.ValueKind != JsonValueKind.String || string.IsNullOrEmpty(envEl.GetString()))
            {
                throw new PublicKeyException("Invalid public key: missing environmentId");
            }

            if (!doc.RootElement.TryGetProperty("identityHost", out var hostEl) || hostEl.ValueKind != JsonValueKind.String || string.IsNullOrEmpty(hostEl.GetString()))
            {
                throw new PublicKeyException("Invalid public key: missing identityHost");
            }

            return new PublicKeyPayload(envEl.GetString()!, AssertTrustedIdentityHost(hostEl.GetString()!, extraHosts));
        }
        catch (PublicKeyException)
        {
            throw;
        }
        catch (Exception ex) when (ex is FormatException or JsonException)
        {
            throw new PublicKeyException("Failed to parse public key");
        }
    }

    private static IEnumerable<string> Suffixes(string? extraHosts)
    {
        foreach (var suffix in DefaultSuffixes)
        {
            yield return suffix;
        }

        if (string.IsNullOrWhiteSpace(extraHosts))
        {
            yield break;
        }

        foreach (var part in extraHosts.Split(','))
        {
            var trimmed = part.Trim().ToLowerInvariant();
            if (trimmed.Length > 0)
            {
                yield return trimmed;
            }
        }
    }

    private static bool IsPrivateOrLoopback(string hostname)
    {
        var h = hostname.ToLowerInvariant();
        if (h.StartsWith('[') && h.EndsWith(']') && h.Length > 2)
        {
            h = h[1..^1];
        }

        if (h == "localhost" || h.EndsWith(".localhost", StringComparison.Ordinal))
        {
            return true;
        }

        if (h.StartsWith("127.", StringComparison.Ordinal) ||
            h.StartsWith("10.", StringComparison.Ordinal) ||
            h.StartsWith("192.168.", StringComparison.Ordinal) ||
            h.StartsWith("169.254.", StringComparison.Ordinal))
        {
            return true;
        }

        if (System.Text.RegularExpressions.Regex.IsMatch(h, @"^172\.(1[6-9]|2\d|3[01])\."))
        {
            return true;
        }

        if (h is "::1" or "[::1]")
        {
            return true;
        }

        return h.StartsWith("fc", StringComparison.Ordinal) ||
               h.StartsWith("fd", StringComparison.Ordinal) ||
               h.StartsWith("[fc", StringComparison.Ordinal) ||
               h.StartsWith("[fd", StringComparison.Ordinal);
    }
}
