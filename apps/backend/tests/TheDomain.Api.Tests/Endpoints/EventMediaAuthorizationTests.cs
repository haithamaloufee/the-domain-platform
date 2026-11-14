using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TheDomain.Domain.Identity;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class EventMediaAuthorizationTests
{
    private const string EventMediaPath =
        "/api/admin/events/00000000-0000-0000-0000-000000000001/media";

    [Fact]
    public async Task EditorCannotModifyEventMedia()
    {
        await using var factory = new RoleApiFactory(UserRole.Editor);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(EventMediaPath);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task MediaManagerCanAccessEventMediaWorkflow()
    {
        await using var factory = new RoleApiFactory(UserRole.MediaManager);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(EventMediaPath);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task EditorCannotModifyCoverPresentation()
    {
        await using var factory = new RoleApiFactory(UserRole.Editor);
        using var client = factory.CreateClient();

        using var response = await client.PutAsJsonAsync(
            $"{EventMediaPath}/00000000-0000-0000-0000-000000000002/presentation",
            new { focalPointX = 0.5, focalPointY = 0.5, zoom = 1.0 });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private sealed class RoleApiFactory(UserRole role) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureTestServices(services =>
            {
                services.AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = TestAuthHandler.AuthScheme;
                        options.DefaultChallengeScheme = TestAuthHandler.AuthScheme;
                        options.DefaultForbidScheme = TestAuthHandler.AuthScheme;
                    })
                    .AddScheme<TestAuthOptions, TestAuthHandler>(TestAuthHandler.AuthScheme,
                        options => options.Role = role.ToString());
            });
        }
    }

    private sealed class TestAuthOptions : AuthenticationSchemeOptions
    {
        public string Role { get; set; } = string.Empty;
    }

    private sealed class TestAuthHandler(
        IOptionsMonitor<TestAuthOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : AuthenticationHandler<TestAuthOptions>(options, logger, encoder)
    {
        public const string AuthScheme = "EventMediaTest";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            Claim[] claims =
            [
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, "Event media test user"),
                new(ClaimTypes.Role, Options.Role)
            ];
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, AuthScheme));
            return Task.FromResult(
                AuthenticateResult.Success(new AuthenticationTicket(principal, AuthScheme)));
        }
    }
}
