using System.Net;
using TheDomain.Api.Tests.Infrastructure;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class AuthenticationEndpointTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task GetCurrentUserRequiresAuthentication()
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
