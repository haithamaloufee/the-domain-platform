using System.Net;
using System.Net.Http.Json;
using TheDomain.Api.Tests.Infrastructure;
using TheDomain.SharedKernel.Api;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class ApiInfoEndpointTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task GetApiInfoReturnsConfiguredApiInformation()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/info");
        var content = await response.Content.ReadFromJsonAsync<ApiInfoResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.Equal("The Domain API", content.ApplicationName);
        Assert.Equal("Development", content.Environment);
        Assert.Equal("1.0.0", content.Version);
    }
}
