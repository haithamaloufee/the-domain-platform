using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
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
    public async Task PublicHomepageDoesNotExposeSectionComposition()
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/api/public/homepage");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStreamAsync());

        response.EnsureSuccessStatusCode();
        Assert.False(json.RootElement.GetProperty("presentation").TryGetProperty("sectionOrder", out _));
        Assert.False(json.RootElement.GetProperty("presentation").TryGetProperty("disabledSections", out _));
    }

    [Fact]
    public async Task PublicStatisticsReturnsTheFourPermanentSlots()
    {
        var repository = new FakeRepository
        {
            Statistics =
            [
                Statistic("fourth", 4),
                Statistic("first", 1),
                Statistic("third", 3),
                Statistic("second", 2)
            ]
        };
        using var cmsFactory = FactoryWithRepository(repository);
        using var client = cmsFactory.CreateClient();

        var response = await client.GetFromJsonAsync<List<PublicStatisticResponse>>("/api/public/statistics");

        Assert.Equal(4, response!.Count);
        Assert.Equal(["first", "second", "third", "fourth"], response.Select(item => item.Label));
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
    [InlineData("/api/public/statistics")]
    [InlineData("/api/public/partners")]
    public async Task CompatibilitySummaryEndpointsAdvertiseDeprecation(string path)
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync(path);

        response.EnsureSuccessStatusCode();
        Assert.Equal("true", response.Headers.GetValues("Deprecation").Single());
    }

    [Theory]
    [InlineData("/api/admin/homepage")]
    [InlineData("/api/admin/statistics")]
    [InlineData("/api/admin/partners")]
    [InlineData("/api/admin/about")]
    [InlineData("/api/admin/team")]
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

    private static StatisticItem Statistic(string label, int slotNumber) =>
        new(Guid.NewGuid(), label, "1", null, null, slotNumber - 1, true, true, DateTimeOffset.UtcNow, slotNumber);

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
        public Task<TheDomain.Domain.Media.MediaAsset?> FindMediaAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<TheDomain.Domain.Media.MediaAsset?>(null);
        public Task<IReadOnlyDictionary<Guid, TheDomain.Domain.Media.MediaAsset>> ListMediaAsync(
            IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, TheDomain.Domain.Media.MediaAsset>>(
                new Dictionary<Guid, TheDomain.Domain.Media.MediaAsset>());
        public Task<TheDomain.Domain.Media.MediaCollection?> FindCollectionAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<TheDomain.Domain.Media.MediaCollection?>(null);
        public void AddHomepage(HomepageContent content) { }
        public void AddStatistic(StatisticItem statistic) { }
        public void AddPartner(Partner partner) { }
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
