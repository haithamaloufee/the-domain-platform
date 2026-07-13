using System.Net;
using TheDomain.Api.Tests.Infrastructure;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class HealthEndpointTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task GetHealthReturnsSuccess()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
