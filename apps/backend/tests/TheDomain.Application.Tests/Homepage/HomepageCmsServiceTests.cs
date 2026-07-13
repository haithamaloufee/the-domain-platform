using TheDomain.Application.Homepage;
using TheDomain.Application.Homepage.Contracts;
using TheDomain.Domain.Homepage;

namespace TheDomain.Application.Tests.Homepage;

public sealed class HomepageCmsServiceTests
{
    [Fact]
    public async Task PublicStatisticsIncludeOnlyVisibleVerifiedItems()
    {
        var repository = new FakeRepository
        {
            Statistics =
            [
                Statistic("public", visible: true, verified: true, sortOrder: 2),
                Statistic("hidden", visible: false, verified: true, sortOrder: 0),
                Statistic("unverified", visible: true, verified: false, sortOrder: 1)
            ]
        };

        var result = await CreateService(repository).GetPublicStatisticsAsync(CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("public", result[0].Label);
    }

    [Fact]
    public async Task PublicPartnersIncludeOnlyVisibleItemsInSortOrder()
    {
        var repository = new FakeRepository
        {
            Partners =
            [
                PartnerItem("later", visible: true, sortOrder: 2),
                PartnerItem("hidden", visible: false, sortOrder: 0),
                PartnerItem("first", visible: true, sortOrder: 1)
            ]
        };

        var result = await CreateService(repository).GetPublicPartnersAsync(CancellationToken.None);

        Assert.Equal(["first", "later"], result.Select(item => item.Slug));
    }

    [Fact]
    public async Task HomepageUpdateRejectsUnsafeCtaHref()
    {
        var repository = new FakeRepository();
        var request = HomepageRequest(primaryCtaHref: "javascript:alert(1)");

        var result = await CreateService(repository).UpdateHomepageAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CmsFailureKind.Validation, result.FailureKind);
        Assert.Contains(result.Errors, error => error.Contains("Primary CTA href", StringComparison.Ordinal));
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task PartnerCreateRejectsDuplicateSlug()
    {
        var repository = new FakeRepository { DuplicatePartnerSlug = true };
        var request = new SavePartnerRequest("Partner", "partner", null, null, null, 0, true, false);

        var result = await CreateService(repository).CreatePartnerAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CmsFailureKind.Conflict, result.FailureKind);
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task PublicHomepageExcludesUnpublishedContent()
    {
        var repository = new FakeRepository { Homepage = CreateHomepage(isPublished: false) };

        var result = await CreateService(repository).GetPublicHomepageAsync(CancellationToken.None);

        Assert.Null(result.Content);
    }

    private static HomepageCmsService CreateService(FakeRepository repository) => new(repository, TimeProvider.System);

    private static StatisticItem Statistic(string label, bool visible, bool verified, int sortOrder) =>
        new(Guid.NewGuid(), label, "1", null, null, sortOrder, visible, verified, DateTimeOffset.UtcNow);

    private static Partner PartnerItem(string slug, bool visible, int sortOrder) =>
        new(Guid.NewGuid(), slug, slug, null, null, null, sortOrder, visible, false, DateTimeOffset.UtcNow);

    private static HomepageContent CreateHomepage(bool isPublished)
    {
        var now = DateTimeOffset.UtcNow;
        return new HomepageContent(HomepageContent.SingletonId, "Eyebrow", "Title", null,
            "Description", "Explore", "/events", null, null, "Why", "Why description",
            "Services", "Services description", "Partners", "Partners description",
            "Contact", "Contact description", "Contact", "/contact", isPublished, now);
    }

    private static UpdateHomepageContentRequest HomepageRequest(string primaryCtaHref) => new(
        "Eyebrow", "Title", null, "Description", "Explore", primaryCtaHref, null, null,
        "Why", "Why description", "Services", "Services description", "Partners",
        "Partners description", "Contact", "Contact description", "Contact", "/contact", false);

    private sealed class FakeRepository : IHomepageCmsRepository
    {
        public HomepageContent? Homepage { get; set; }
        public IReadOnlyList<StatisticItem> Statistics { get; init; } = [];
        public IReadOnlyList<Partner> Partners { get; init; } = [];
        public bool DuplicatePartnerSlug { get; init; }
        public int SaveCount { get; private set; }

        public Task<HomepageContent?> GetHomepageAsync(CancellationToken cancellationToken) => Task.FromResult(Homepage);
        public Task<IReadOnlyList<StatisticItem>> ListStatisticsAsync(CancellationToken cancellationToken) => Task.FromResult(Statistics);
        public Task<StatisticItem?> FindStatisticAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(Statistics.SingleOrDefault(item => item.Id == id));
        public Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken cancellationToken) => Task.FromResult(Partners);
        public Task<Partner?> FindPartnerAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(Partners.SingleOrDefault(item => item.Id == id));
        public Task<bool> PartnerSlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => Task.FromResult(DuplicatePartnerSlug);
        public void AddHomepage(HomepageContent content) => Homepage = content;
        public void AddStatistic(StatisticItem statistic) { }
        public void AddPartner(Partner partner) { }
        public Task SaveChangesAsync(CancellationToken cancellationToken) { SaveCount++; return Task.CompletedTask; }
    }
}
