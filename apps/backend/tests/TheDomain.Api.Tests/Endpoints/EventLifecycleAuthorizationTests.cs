using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;
using TheDomain.Domain.Identity;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class EventLifecycleAuthorizationTests
{
    [Fact]
    public async Task EditorCannotAccessEventLifecycleManagement()
    {
        await using var factory = new RoleApiFactory(UserRole.Editor);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/admin/events");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AdminCanAccessEventLifecycleManagement()
    {
        await using var factory = new RoleApiFactory(UserRole.Admin);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/admin/events");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task MissingEventReturnsNotFoundInsteadOfServerError()
    {
        await using var factory = new RoleApiFactory(UserRole.Admin);
        using var client = factory.CreateClient();

        using var response = await client.PostAsync(
            "/api/admin/events/00000000-0000-0000-0000-000000000001/publish",
            null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private sealed class RoleApiFactory(UserRole role) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IEventService>();
                services.AddSingleton<IEventService, MissingEventService>();
                services.AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = TestAuthHandler.AuthScheme;
                        options.DefaultChallengeScheme = TestAuthHandler.AuthScheme;
                        options.DefaultForbidScheme = TestAuthHandler.AuthScheme;
                    })
                    .AddScheme<TestAuthOptions, TestAuthHandler>(
                        TestAuthHandler.AuthScheme,
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
        public const string AuthScheme = "EventLifecycleTest";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            Claim[] claims =
            [
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, "Event lifecycle test user"),
                new(ClaimTypes.Role, Options.Role)
            ];
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, AuthScheme));
            return Task.FromResult(
                AuthenticateResult.Success(new AuthenticationTicket(principal, AuthScheme)));
        }
    }

    private sealed class MissingEventService : IEventService
    {
        public Task<IReadOnlyList<AdminEventResponse>> GetAdminEventsAsync(
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<AdminEventResponse>>([]);

        public Task<AdminEventResponse?> GetAdminByIdAsync(
            Guid id,
            CancellationToken cancellationToken) => Task.FromResult<AdminEventResponse?>(null);

        public Task<EventOperationResult<AdminEventResponse>> PublishAsync(
            Guid id,
            CancellationToken cancellationToken) => Task.FromResult(NotFound());

        public Task<EventOperationResult<AdminEventResponse>> ArchiveAsync(
            Guid id,
            CancellationToken cancellationToken) => Task.FromResult(NotFound());

        public Task<EventOperationResult<AdminEventResponse>> CancelAsync(
            Guid id,
            CancellationToken cancellationToken) => Task.FromResult(NotFound());

        public Task<EventOperationResult<AdminEventResponse>> CreateAsync(
            SaveEventRequest request,
            CancellationToken cancellationToken) => Task.FromResult(NotFound());

        public Task<EventOperationResult<AdminEventResponse>> UpdateAsync(
            Guid id,
            SaveEventRequest request,
            CancellationToken cancellationToken) => Task.FromResult(NotFound());

        public Task<IReadOnlyList<PublicEventListResponse>> GetUpcomingAsync(
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<PublicEventListResponse>>([]);

        public Task<IReadOnlyList<PublicEventListResponse>> GetPreviousAsync(
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<PublicEventListResponse>>([]);

        public Task<IReadOnlyList<PublicEventListResponse>> GetFeaturedAsync(
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<PublicEventListResponse>>([]);

        public Task<PublicEventDetailsResponse?> GetPublicBySlugAsync(
            string slug,
            CancellationToken cancellationToken) =>
            Task.FromResult<PublicEventDetailsResponse?>(null);

        public Task<IReadOnlyList<GalleryAlbumListResponse>> GetGalleryAlbumsAsync(
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<GalleryAlbumListResponse>>([]);

        public Task<GalleryAlbumDetailsResponse?> GetGalleryAlbumAsync(
            string slug,
            CancellationToken cancellationToken) =>
            Task.FromResult<GalleryAlbumDetailsResponse?>(null);

        private static EventOperationResult<AdminEventResponse> NotFound() =>
            EventOperationResult.NotFound<AdminEventResponse>("Event was not found.");
    }
}
