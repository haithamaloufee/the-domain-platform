using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TheDomain.Api.Tests.Infrastructure;
using TheDomain.Application.Homepage;
using TheDomain.Application.Homepage.Contracts;
using TheDomain.Domain.Homepage;

namespace TheDomain.Api.Tests.Endpoints;

public sealed class HomepageCmsEndpointTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task PublicStatisticsReturnsOnlyVisibleVerifiedItems()
    {
        var repository = new FakeRepository
        {
            Statistics =
            [
                Statistic("public", visible: true, verified: true),
                Statistic("hidden", visible: false, verified: true),
                Statistic("unverified", visible: true, verified: false)
            ]
        };
        using var cmsFactory = FactoryWithRepository(repository);
        using var client = cmsFactory.CreateClient();

        var response = await client.GetFromJsonAsync<List<PublicStatisticResponse>>("/api/public/statistics");

        var item = Assert.Single(response!);
        Assert.Equal("public", item.Label);
    }

    [Fact]
    public async Task PublicPartnersReturnsOnlyVisibleItems()
    {
        var repository = new FakeRepository
        {
            Partners = [PartnerItem("public", true), PartnerItem("hidden", false)]
        };
        using var cmsFactory = FactoryWithRepository(repository);
        using var client = cmsFactory.CreateClient();

        var response = await client.GetFromJsonAsync<List<PublicPartnerResponse>>("/api/public/partners");

        var item = Assert.Single(response!);
        Assert.Equal("public", item.Slug);
    }

    [Theory]
    [InlineData("/api/admin/homepage")]
    [InlineData("/api/admin/statistics")]
    [InlineData("/api/admin/partners")]
    public async Task AdminCmsEndpointsRequireAuthentication(string path)
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync(path);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> FactoryWithRepository(
        IHomepageCmsRepository repository) => factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
    {
        services.RemoveAll<IHomepageCmsRepository>();
        services.RemoveAll<IHomepageCmsService>();
        services.AddSingleton(repository);
        services.AddScoped<IHomepageCmsService, HomepageCmsService>();
    }));

    private static StatisticItem Statistic(string label, bool visible, bool verified) =>
        new(Guid.NewGuid(), label, "1", null, null, 0, visible, verified, DateTimeOffset.UtcNow);

    private static Partner PartnerItem(string slug, bool visible) =>
        new(Guid.NewGuid(), slug, slug, null, null, null, 0, visible, false, DateTimeOffset.UtcNow);

    private sealed class FakeRepository : IHomepageCmsRepository
    {
        public IReadOnlyList<StatisticItem> Statistics { get; init; } = [];
        public IReadOnlyList<Partner> Partners { get; init; } = [];
        public Task<HomepageContent?> GetHomepageAsync(CancellationToken cancellationToken) => Task.FromResult<HomepageContent?>(null);
        public Task<IReadOnlyList<StatisticItem>> ListStatisticsAsync(CancellationToken cancellationToken) => Task.FromResult(Statistics);
        public Task<StatisticItem?> FindStatisticAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<StatisticItem?>(null);
        public Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken cancellationToken) => Task.FromResult(Partners);
        public Task<Partner?> FindPartnerAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<Partner?>(null);
        public Task<bool> PartnerSlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => Task.FromResult(false);
        public void AddHomepage(HomepageContent content) { }
        public void AddStatistic(StatisticItem statistic) { }
        public void AddPartner(Partner partner) { }
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
