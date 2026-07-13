using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Media;

public sealed class MediaManagementServiceTests
{
    [Fact]
    public async Task MediaListCapsPageSize()
    {
        var service = CreateService(new FakeRepository());
        var result = await service.GetAsync(new MediaListQuery(PageNumber: 1, PageSize: 500), CancellationToken.None);
        Assert.Equal(50, result.PageSize);
    }

    [Fact]
    public async Task AssignmentRejectsInvalidEvent()
    {
        var repository = new FakeRepository { Media = CreateMedia(MediaApprovalStatus.Approved) };
        var result = await CreateService(repository).AssignAsync(Guid.NewGuid(), new AssignEventMediaRequest(repository.Media.Id, EventMediaUsage.Gallery, 0, false), CancellationToken.None);
        Assert.False(result.IsSuccess); Assert.Contains("Event was not found.", result.Errors);
    }

    [Fact]
    public async Task EventMediaListIncludesAssignmentAndAssetMetadataInOrder()
    {
        var repository = new FakeRepository { Event = CreateEvent(), Media = CreateMedia(MediaApprovalStatus.Approved) };
        var later = new EventMedia(Guid.NewGuid(), repository.Event.Id, repository.Media.Id, EventMediaUsage.Gallery, 20, false, DateTimeOffset.UtcNow);
        var earlier = new EventMedia(Guid.NewGuid(), repository.Event.Id, repository.Media.Id, EventMediaUsage.Gallery, 10, true, DateTimeOffset.UtcNow.AddMinutes(-1));
        repository.Event.AddMedia(earlier, repository.Media);
        repository.Event.AddMedia(later, repository.Media);
        repository.EventMedia = [later, earlier];

        var result = await CreateService(repository).GetEventMediaAsync(repository.Event.Id, CancellationToken.None);

        Assert.Equal([earlier.Id, later.Id], result.Select(item => item.Id));
        Assert.All(result, item => Assert.Equal(repository.Media.Id, item.Media.Id));
        Assert.True(result[0].IsFeatured);
    }

    [Fact]
    public async Task AssignmentRejectsDuplicate()
    {
        var repository = new FakeRepository { Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent(), Duplicate = true };
        var result = await CreateService(repository).AssignAsync(repository.Event.Id, new AssignEventMediaRequest(repository.Media.Id, EventMediaUsage.Gallery, 0, false), CancellationToken.None);
        Assert.False(result.IsSuccess); Assert.Contains(result.Errors, error => error.Contains("already exists", StringComparison.Ordinal));
    }

    [Fact]
    public async Task PublicGalleryIncludesOnlyApprovedMedia()
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var approved = CreateMedia(MediaApprovalStatus.Approved); var draft = CreateMedia(MediaApprovalStatus.Draft); var hidden = CreateMedia(MediaApprovalStatus.Hidden);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, approved.Id, EventMediaUsage.Gallery, 0, false, DateTimeOffset.UtcNow), approved);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, draft.Id, EventMediaUsage.Gallery, 1, false, DateTimeOffset.UtcNow), draft);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, hidden.Id, EventMediaUsage.Gallery, 2, false, DateTimeOffset.UtcNow), hidden);
        var events = new EventRepositoryFake(eventEntity);
        var service = new TheDomain.Application.Events.EventService(events, TimeProvider.System);
        var albums = await service.GetGalleryAlbumsAsync(CancellationToken.None);
        var album = await service.GetGalleryAlbumAsync(eventEntity.Slug, CancellationToken.None);
        Assert.Single(albums); Assert.Equal(1, albums[0].MediaCount);
        Assert.NotNull(album); Assert.Single(album.Media); Assert.Equal(approved.Id, album.Media[0].Id);
    }

    [Fact]
    public async Task PublicEventListReturnsOneCoverWhileDetailsReturnApprovedMedia()
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var hero = CreateMedia(MediaApprovalStatus.Approved);
        var gallery = CreateMedia(MediaApprovalStatus.Approved);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, gallery.Id, EventMediaUsage.Gallery, 0, false, DateTimeOffset.UtcNow), gallery);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, hero.Id, EventMediaUsage.Hero, 10, false, DateTimeOffset.UtcNow), hero);
        var service = new TheDomain.Application.Events.EventService(new EventRepositoryFake(eventEntity), TimeProvider.System);

        var events = await service.GetUpcomingAsync(CancellationToken.None);
        var details = await service.GetPublicBySlugAsync(eventEntity.Slug, CancellationToken.None);

        Assert.Single(events);
        Assert.Equal(hero.Id, events[0].CoverMedia?.Id);
        Assert.NotNull(details);
        Assert.Equal(2, details.Media.Count);
    }

    private static MediaManagementService CreateService(FakeRepository repository) => new(repository, new FakeStorage(), new MediaUploadPolicy(10, 20, new Dictionary<string, string[]> { ["image/jpeg"] = [".jpg"] }), TimeProvider.System);
    private static MediaAsset CreateMedia(MediaApprovalStatus status) => new(Guid.NewGuid(), "media.jpg", "media.jpg", MediaType.Image, "https://example.com/media.jpg", null, 100, 100, null, MediaOrientation.Square, null, null, "Alt", status, "public-id", DateTimeOffset.UtcNow);
    private static EntertainmentEvent CreateEvent() { var now = DateTimeOffset.UtcNow; return new(Guid.NewGuid(), "event", "Event", "Short", "Long", "Concert", now.AddDays(1), now.AddDays(2), "Asia/Amman", "Amman", "Venue", null, null, null, false, null, null, false, false, now); }

    private sealed class FakeStorage : IMediaStorageService
    { public Task<StoredMediaResult> UploadAsync(Stream content, string fileName, string publicId, MediaType mediaType, CancellationToken cancellationToken) => Task.FromResult(new StoredMediaResult("https://example.com/media.jpg", null, publicId, 100, 100, null)); public Task DeleteAsync(string publicId, MediaType mediaType, CancellationToken cancellationToken) => Task.CompletedTask; }
    private sealed class FakeRepository : IMediaRepository
    {
        public MediaAsset Media { get; init; } = CreateMedia(MediaApprovalStatus.Approved); public EntertainmentEvent? Event { get; init; } public bool Duplicate { get; init; }
        public IReadOnlyList<EventMedia> EventMedia { get; set; } = [];
        public Task<(IReadOnlyList<MediaAsset> Items, int TotalCount)> SearchAsync(MediaListQuery query, CancellationToken token) => Task.FromResult<(IReadOnlyList<MediaAsset>, int)>(([], 0));
        public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) => Task.FromResult(Media.Id == id ? Media : null);
        public Task<EntertainmentEvent?> FindEventAsync(Guid id, CancellationToken token) => Task.FromResult(Event?.Id == id ? Event : null);
        public Task<IReadOnlyList<EventMedia>> ListEventMediaAsync(Guid eventId, CancellationToken token) => Task.FromResult(EventMedia);
        public Task<EventMedia?> FindEventMediaAsync(Guid eventId, Guid eventMediaId, CancellationToken token) => Task.FromResult<EventMedia?>(null);
        public Task<bool> AssignmentExistsAsync(Guid eventId, Guid mediaAssetId, EventMediaUsage usage, Guid? excludingId, CancellationToken token) => Task.FromResult(Duplicate);
        public void AddMedia(MediaAsset media) { } public void AddEventMedia(EventMedia eventMedia) { } public void RemoveEventMedia(EventMedia eventMedia) { } public Task SaveChangesAsync(CancellationToken token) => Task.CompletedTask;
    }
    private sealed class EventRepositoryFake(params EntertainmentEvent[] events) : TheDomain.Application.Events.IEventRepository
    {
        public Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<EntertainmentEvent>>(events);
        public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(events.SingleOrDefault(item => item.Id == id));
        public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) => Task.FromResult(events.SingleOrDefault(item => item.Slug == slug));
        public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => Task.FromResult(false);
        public void Add(EntertainmentEvent eventEntity) { } public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
