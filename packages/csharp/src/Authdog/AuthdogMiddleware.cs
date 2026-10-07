using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Authdog;

public sealed class AuthdogMiddleware(RequestDelegate next, AuthdogClient client, bool requireAuth)
{
    public const string ContextItem = "authdog.context";

    public async Task InvokeAsync(HttpContext context)
    {
        var resolved = client.Resolve(context.Request.Headers.Authorization.ToString(), HeaderOrNull(context.Request.Headers.Cookie));
        context.Items[ContextItem] = resolved;
        if (requireAuth && !resolved.Authenticated)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"Unauthorized\"}");
            return;
        }

        await next(context);
    }

    private static string? HeaderOrNull(Microsoft.Extensions.Primitives.StringValues value)
    {
        var text = value.ToString();
        return string.IsNullOrEmpty(text) ? null : text;
    }
}

public static class AuthdogApplicationBuilderExtensions
{
    public static IApplicationBuilder UseAuthdog(this IApplicationBuilder app, string publicKey) =>
        app.UseMiddleware<AuthdogMiddleware>(new AuthdogClient(publicKey), false);

    public static IApplicationBuilder UseAuthdogRequireAuth(this IApplicationBuilder app, string publicKey) =>
        app.UseMiddleware<AuthdogMiddleware>(new AuthdogClient(publicKey), true);

    public static IApplicationBuilder UseAuthdog(this IApplicationBuilder app, AuthdogClient client) =>
        app.UseMiddleware<AuthdogMiddleware>(client, false);

    public static IApplicationBuilder UseAuthdogRequireAuth(this IApplicationBuilder app, AuthdogClient client) =>
        app.UseMiddleware<AuthdogMiddleware>(client, true);
}

public static class AuthdogLogout
{
    public static Task WriteAsync(HttpContext context, AuthdogClient client)
    {
        var logout = client.Logout(context.Request.Query["redirect_uri"].ToString());
        context.Response.StatusCode = StatusCodes.Status302Found;
        context.Response.Headers.SetCookie = logout.SetCookie;
        context.Response.Headers.Location = logout.Location;
        return Task.CompletedTask;
    }
}
