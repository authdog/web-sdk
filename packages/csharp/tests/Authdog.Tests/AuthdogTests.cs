using System.Text;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Authdog.Tests;

public class AuthdogTests
{
    private static string MakePk(string json) =>
        "pk_" + Convert.ToBase64String(Encoding.UTF8.GetBytes(json));

    private static string TrustedPk() =>
        MakePk("{\"environmentId\":\"env_1\",\"identityHost\":\"https://id.authdog.com\"}");

    [Fact]
    public void ParsesPublicKeyAndRejectsUntrustedHosts()
    {
        var payload = PublicKey.ValidateAndParse(MakePk("{\"environmentId\":\"env_1\",\"identityHost\":\"https://id.authdog.com/\"}"));
        Assert.Equal("env_1", payload.EnvironmentId);
        Assert.Equal("https://id.authdog.com", payload.IdentityHost);
        Assert.Throws<PublicKeyException>(() => PublicKey.AssertTrustedIdentityHost("https://evil.com"));
        Assert.Throws<PublicKeyException>(() => PublicKey.AssertTrustedIdentityHost("https://127.0.0.1"));
        Assert.Equal(
            "https://id.self-hosted.test",
            PublicKey.AssertTrustedIdentityHost("https://id.self-hosted.test", "id.self-hosted.test"));
    }

    [Fact]
    public void CookiesRedirectsAndGate()
    {
        var cookies = Cookies.Parse("authdog-session=ab=cd==; other=1");
        Assert.Equal("ab=cd==", cookies["authdog-session"]);
        Assert.Equal("a b", Cookies.Parse("k=a%20b")["k"]);
        Assert.Equal("abc.def", Cookies.SessionToken("Bearer abc.def", "authdog-session=cookie"));
        Assert.Equal("/", Redirects.Sanitize("//evil.com"));
        Assert.Equal("/dashboard", Redirects.Sanitize("/dashboard"));
        Assert.Contains("HttpOnly;", Redirects.ExpiredSessionCookie(false));
        Assert.Contains("Secure;", Redirects.ExpiredSessionCookie(true));

        var client = new AuthdogClient(TrustedPk(), true, (url, token) =>
        {
            Assert.StartsWith("https://id.authdog.com/oidc/env_1/userinfo", url);
            Assert.Equal("aaa.bbb.ccc", token);
            return "{\"meta\":{\"code\":200},\"user\":{\"id\":\"u1\"}}";
        });
        var gate = client.RequireAuth(null, "authdog-session=aaa.bbb.ccc");
        Assert.True(gate.Authenticated);
        Assert.Equal("u1", gate.Context.User!.Value.GetProperty("id").GetString());

        var denied = new AuthdogClient(TrustedPk(), true, (_, _) => "{\"meta\":{\"code\":401}}");
        var blocked = denied.RequireAuth("Bearer aaa.bbb.ccc", null);
        Assert.False(blocked.Authenticated);
        Assert.Equal(401, blocked.Status);
        Assert.Equal("{\"error\":\"Unauthorized\"}", blocked.Body);

        var down = new AuthdogClient(TrustedPk(), true, (_, _) => throw new InvalidOperationException("down"));
        Assert.False(down.Resolve("Bearer aaa.bbb.ccc", null).Authenticated);

        var logout = client.Logout("//evil.com");
        Assert.Equal("/", logout.Location);
        Assert.StartsWith("authdog-session=;", logout.SetCookie);
    }

    [Fact]
    public async Task MiddlewareReturns401AndLogoutRedirects()
    {
        var denied = new AuthdogClient(TrustedPk(), true, (_, _) => "{\"meta\":{\"code\":401}}");
        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer aaa.bbb.ccc";
        context.Response.Body = new MemoryStream();
        var nextCalled = false;
        var middleware = new AuthdogMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        }, denied, true);

        await middleware.InvokeAsync(context);

        Assert.False(nextCalled);
        Assert.Equal(401, context.Response.StatusCode);
        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body);
        Assert.Equal("{\"error\":\"Unauthorized\"}", await reader.ReadToEndAsync());

        var logoutContext = new DefaultHttpContext();
        logoutContext.Request.QueryString = new QueryString("?redirect_uri=https://evil.com");
        await AuthdogLogout.WriteAsync(logoutContext, denied);
        Assert.Equal(302, logoutContext.Response.StatusCode);
        Assert.Equal("/", logoutContext.Response.Headers.Location.ToString());
        Assert.StartsWith("authdog-session=;", logoutContext.Response.Headers.SetCookie.ToString());
    }
}
