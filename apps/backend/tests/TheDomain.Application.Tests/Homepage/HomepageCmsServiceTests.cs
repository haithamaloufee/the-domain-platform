using TheDomain.Application.Homepage;
using TheDomain.Application.Homepage.Contracts;
using TheDomain.Domain.Homepage;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Homepage;

public sealed class HomepageCmsServiceTests
{
    [Fact]
    public async Task StatisticSlotsCannotBeReorderedWhilePartnersStillCan()
    {
        var firstStatistic = new StatisticItem(Guid.NewGuid(), "First", "1", null, null, 0, true, true, DateTimeOffset.UtcNow, 1);
        var secondStatistic = new StatisticItem(Guid.NewGuid(), "Second", "2", null, null, 1, true, true, DateTimeOffset.UtcNow, 2);
        var firstPartner = new Partner(Guid.NewGuid(), "First", "first", null, null, null, 0, true, false, DateTimeOffset.UtcNow);
        var secondPartner = new Partner(Guid.NewGuid(), "Second", "second", null, null, null, 1, true, false, DateTimeOffset.UtcNow);
        var service = new HomepageCmsService(new FakeRepository { Statistics = [firstStatistic, secondStatistic], Partners = [firstPartner, secondPartner] }, TimeProvider.System);
        Assert.False((await service.ReorderStatisticsAsync(new([firstStatistic.Id, firstStatistic.Id]), default)).IsSuccess);
        Assert.False((await service.ReorderStatisticsAsync(new([secondStatistic.Id, firstStatistic.Id]), default)).IsSuccess);
        Assert.True((await service.ReorderPartnersAsync(new([secondPartner.Id, firstPartner.Id]), default)).IsSuccess);
        Assert.Equal(1, secondStatistic.SortOrder); Assert.Equal(0, secondPartner.SortOrder);
    }

    [Fact]
    public async Task StatisticsPhrasePersistsAndValidatesLength()
    {
        var repository = new FakeRepository { Homepage = CreateHomepage(false) }; var service = new HomepageCmsService(repository, TimeProvider.System);
        Assert.False((await service.SaveStatisticsPresentationAsync(new("", true), default)).IsSuccess);
        Assert.True((await service.SaveStatisticsPresentationAsync(new("Experience in motion", true), default)).IsSuccess);
        Assert.Equal("Experience in motion", (await service.GetStatisticsPresentationAsync(default)).Phrase);
    }
    [Fact]
    public async Task PublicStatisticsUseTheFourPermanentSlotsInSlotOrder()
    {
        var repository = new FakeRepository
        {
            Statistics =
            [
                Statistic("fourth", 4),
                Statistic("first", 1),
                Statistic("legacy", null),
                Statistic("third", 3),
                Statistic("second", 2)
            ]
        };

        var result = await CreateService(repository).GetPublicStatisticsAsync(CancellationToken.None);

        Assert.Equal(4, result.Count);
        Assert.Equal(["first", "second", "third", "fourth"], result.Select(item => item.Label));
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
    public async Task PublicPartnerLogoReflectsCurrentMediaEligibility()
    {
        var logo = ApprovedImage();
        var partner = new Partner(Guid.NewGuid(), "Northstar", "northstar", logo.Url, null, null,
            0, true, true, DateTimeOffset.UtcNow, logo.Id);
        var repository = new FakeRepository
        {
            Partners = [partner],
            Media = new Dictionary<Guid, MediaAsset> { [logo.Id] = logo }
        };
        var service = CreateService(repository);

        Assert.Equal(logo.Url, Assert.Single(await service.GetPublicPartnersAsync(default)).LogoUrl);

        logo.Hide(DateTimeOffset.UtcNow);

        Assert.Null(Assert.Single(await service.GetPublicPartnersAsync(default)).LogoUrl);
    }

    [Fact]
    public async Task StatisticSlotsRejectCreationAndNonNumericValues()
    {
        var statistic = Statistic("First", 1);
        var service = CreateService(new FakeRepository { Statistics = [statistic] });

        var create = await service.CreateStatisticAsync(new("New", "5", "+", null, 0, true, true), default);
        var update = await service.UpdateStatisticAsync(statistic.Id,
            new("First", "10+", null, null, 0, true, true), default);

        Assert.Equal(CmsFailureKind.Conflict, create.FailureKind);
        Assert.Equal(CmsFailureKind.Validation, update.FailureKind);
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
    public async Task HomepageBuilderRejectsIncompleteSectionOrder()
    {
        var repository = new FakeRepository();
        var request = HomepageRequest("/events") with { SectionOrder = ["events", "gallery"] };

        var result = await CreateService(repository).UpdateHomepageAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains("every predefined homepage section", StringComparison.Ordinal));
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task HomepageBuilderPersistsContextualPresentationInSingleSave()
    {
        string[] order = ["contact", "partners", "services", "gallery", "previous", "why", "statistics", "events"];
        var repository = new FakeRepository();
        var request = HomepageRequest("/events") with
        {
            SectionOrder = order,
            DisabledSections = ["why"],
            EventsTitle = "Tonight at The Domain",
            EventsDescription = "A curated programme.",
            PreviousEventsTitle = "From the archive",
            PreviousEventsDescription = "Stories worth revisiting.",
            GalleryTitle = "Selected frames",
            GalleryDescription = "A visual edit."
        };

        var result = await CreateService(repository).UpdateHomepageAsync(request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(order, result.Value!.Builder.SectionOrder);
        Assert.Equal(["why"], result.Value.Builder.DisabledSections);
        Assert.Equal("Tonight at The Domain", result.Value.Builder.EventsTitle);
        Assert.Equal(1, repository.SaveCount);
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

    private static StatisticItem Statistic(string label, int? slotNumber) =>
        new(Guid.NewGuid(), label, "1", null, null, slotNumber.HasValue ? slotNumber.Value - 1 : 99,
            true, true, DateTimeOffset.UtcNow, slotNumber);

    private static Partner PartnerItem(string slug, bool visible, int sortOrder) =>
        new(Guid.NewGuid(), slug, slug, null, null, null, sortOrder, visible, false, DateTimeOffset.UtcNow);

    private static MediaAsset ApprovedImage() => new(Guid.NewGuid(), "northstar.png",
        "northstar.png", MediaType.Image, "https://res.cloudinary.com/demo/northstar.png", null,
        800, 320, null, MediaOrientation.Landscape, "Partners", null, "Northstar logo",
        MediaApprovalStatus.Approved, "demo/northstar", DateTimeOffset.UtcNow);

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
        public IReadOnlyDictionary<Guid, TheDomain.Domain.Media.MediaAsset> Media { get; init; } =
            new Dictionary<Guid, TheDomain.Domain.Media.MediaAsset>();
        public int SaveCount { get; private set; }

        public Task<HomepageContent?> GetHomepageAsync(CancellationToken cancellationToken) => Task.FromResult(Homepage);
        public Task<IReadOnlyList<StatisticItem>> ListStatisticsAsync(CancellationToken cancellationToken) => Task.FromResult(Statistics);
        public Task<StatisticItem?> FindStatisticAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(Statistics.SingleOrDefault(item => item.Id == id));
        public Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken cancellationToken) => Task.FromResult(Partners);
        public Task<Partner?> FindPartnerAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(Partners.SingleOrDefault(item => item.Id == id));
        public Task<bool> PartnerSlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => Task.FromResult(DuplicatePartnerSlug);
        public Task<TheDomain.Domain.Media.MediaAsset?> FindMediaAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(Media.GetValueOrDefault(id));
        public Task<IReadOnlyDictionary<Guid, TheDomain.Domain.Media.MediaAsset>> ListMediaAsync(
            IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyDictionary<Guid, TheDomain.Domain.Media.MediaAsset>>(
                Media.Where(item => ids.Contains(item.Key)).ToDictionary());
        public Task<TheDomain.Domain.Media.MediaCollection?> FindCollectionAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<TheDomain.Domain.Media.MediaCollection?>(null);
        public void AddHomepage(HomepageContent content) => Homepage = content;
        public void AddStatistic(StatisticItem statistic) { }
        public void AddPartner(Partner partner) { }
        public Task SaveChangesAsync(CancellationToken cancellationToken) { SaveCount++; return Task.CompletedTask; }
    }
}
