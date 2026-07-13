using System.Net;
using TheDomain.Api.Tests.Infrastructure;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class AdminMediaEndpointTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>
{
    [Theory]
    [InlineData("/api/admin/media")]
    [InlineData("/api/admin/media/upload")]
    [InlineData("/api/admin/events/00000000-0000-0000-0000-000000000001/media")]
    public async Task MediaAdministrationRequiresAuthentication(string path)
    {
        using var client = factory.CreateClient(); using var response = path.EndsWith("upload", StringComparison.Ordinal) || path.EndsWith("media", StringComparison.Ordinal) && path.Contains("events", StringComparison.Ordinal)
            ? await client.PostAsync(path, null) : await client.GetAsync(path);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
