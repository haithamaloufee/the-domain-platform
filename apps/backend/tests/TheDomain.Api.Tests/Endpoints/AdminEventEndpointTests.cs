using System.Net;
using System.Net.Http.Json;
using TheDomain.Api.Tests.Infrastructure;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class AdminEventEndpointTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task AdminEventsRequiresAuthentication()
    {
        using var client = factory.CreateClient(); using var response = await client.GetAsync("/api/admin/events");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreatingDraftRequiresAuthentication()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/api/admin/events", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
