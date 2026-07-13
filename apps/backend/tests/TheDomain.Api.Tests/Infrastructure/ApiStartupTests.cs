using System.Net;

namespace TheDomain.Api.Tests.Infrastructure;

public sealed class ApiStartupTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task ApiStartsWithPersistenceDisabled()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/info");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
