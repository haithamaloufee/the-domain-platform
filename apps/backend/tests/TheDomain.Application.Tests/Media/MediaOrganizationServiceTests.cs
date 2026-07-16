using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Media;

public sealed class MediaOrganizationServiceTests
{
    [Fact]
    public async Task SameMediaCanBeAddedToMultipleCollections()
    {
        var repository = new FakeRepository(); var service = CreateService(repository);
        var first = (await service.CreateCollectionAsync(new("Highlights"), default)).Value!;
        var second = (await service.CreateCollectionAsync(new("Campaign"), default)).Value!;

        Assert.True((await service.AddToCollectionAsync(first.Id, new(repository.Media.Id), default)).IsSuccess);
        Assert.True((await service.AddToCollectionAsync(second.Id, new(repository.Media.Id), default)).IsSuccess);
        Assert.Equal(2, repository.Items.Count);
    }

    [Fact]
    public async Task CollectionMustBeArchivedBeforeDeletion()
    {
        var repository = new FakeRepository(); var service = CreateService(repository);
        var collection = (await service.CreateCollectionAsync(new("Highlights"), default)).Value!;
        Assert.False((await service.DeleteCollectionAsync(collection.Id, default)).IsSuccess);
        await service.ArchiveCollectionAsync(collection.Id, default);
        Assert.True((await service.DeleteCollectionAsync(collection.Id, default)).IsSuccess);
    }

    [Fact]
    public async Task PermanentDeletionRequiresArchiveNoUsageAndExactFilename()
    {
        var repository = new FakeRepository(); var storage = new FakeStorage(); var service = CreateService(repository, storage);
        Assert.False((await service.PermanentlyDeleteMediaAsync(repository.Media.Id, new("media.jpg"), default)).IsSuccess);
        await service.ArchiveMediaAsync(repository.Media.Id, default);
        repository.HasEventUsage = true;
        Assert.False((await service.PermanentlyDeleteMediaAsync(repository.Media.Id, new("media.jpg"), default)).IsSuccess);
        repository.HasEventUsage = false;
        Assert.False((await service.PermanentlyDeleteMediaAsync(repository.Media.Id, new("wrong.jpg"), default)).IsSuccess);
        Assert.True((await service.PermanentlyDeleteMediaAsync(repository.Media.Id, new("media.jpg"), default)).IsSuccess);
        Assert.True(storage.Deleted); Assert.Null(repository.MediaRecord);
    }

    [Fact]
    public async Task BrandingUsageBlocksPermanentDeletion()
    {
        var repository = new FakeRepository { HasBrandingUsage = true };
        var service = CreateService(repository);
        await service.ArchiveMediaAsync(repository.Media.Id, default);
        Assert.False((await service.PermanentlyDeleteMediaAsync(repository.Media.Id, new("media.jpg"), default)).IsSuccess);
        Assert.NotNull(repository.MediaRecord);
    }

    private static MediaOrganizationService CreateService(FakeRepository repository, FakeStorage? storage = null) =>
        new(repository, storage ?? new FakeStorage(), TimeProvider.System);

    private sealed class FakeStorage : IMediaStorageService
    {
        public bool Deleted { get; private set; }
        public Task<StoredMediaResult> UploadAsync(Stream content, string fileName, string publicId, MediaType mediaType, CancellationToken token) => throw new NotSupportedException();
        public Task DeleteAsync(string publicId, MediaType mediaType, CancellationToken token) { Deleted = true; return Task.CompletedTask; }
    }
    private sealed class FakeRepository : IMediaOrganizationRepository
    {
        public MediaAsset Media { get; } = new(Guid.NewGuid(), "media.jpg", "media.jpg", MediaType.Image, "https://example.com/media.jpg", null, 100, 100, null, MediaOrientation.Square, null, null, null, MediaApprovalStatus.Approved, "media-id", DateTimeOffset.UtcNow);
        public MediaAsset? MediaRecord { get; private set; }
        public bool HasEventUsage { get; set; }
        public bool HasBrandingUsage { get; set; }
        public List<MediaCollection> Collections { get; } = [];
        public List<MediaCollectionItem> Items { get; } = [];
        public FakeRepository() { MediaRecord = Media; }
        public Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool includeArchived, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollection>>(Collections.Where(item => includeArchived || !item.IsArchived).ToArray());
        public Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token) => Task.FromResult(Collections.SingleOrDefault(item => item.Id == id));
        public Task<bool> CollectionNameExistsAsync(string name, Guid? excludingId, CancellationToken token) => Task.FromResult(Collections.Any(item => item.Name == name && item.Id != excludingId));
        public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) => Task.FromResult(MediaRecord?.Id == id ? MediaRecord : null);
        public Task<IReadOnlyList<MediaCollectionItem>> ListCollectionItemsAsync(Guid id, bool tracking, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollectionItem>>(Items.Where(item => item.CollectionId == id).OrderBy(item => item.SortOrder).ToArray());
        public Task<MediaUsageResponse?> GetUsageAsync(Guid id, CancellationToken token) => Task.FromResult<MediaUsageResponse?>(MediaRecord?.Id != id ? null : new(id, HasEventUsage ? [new(Guid.NewGuid(), "Event", EventMediaUsage.Gallery, false)] : [], [], HasBrandingUsage ? [new("Primary logo")] : [], !HasEventUsage && !HasBrandingUsage));
        public void AddCollection(MediaCollection collection) => Collections.Add(collection);
        public void AddCollectionItem(MediaCollectionItem item) => Items.Add(item);
        public void RemoveCollection(MediaCollection collection) { Collections.Remove(collection); Items.RemoveAll(item => item.CollectionId == collection.Id); }
        public void RemoveCollectionItem(MediaCollectionItem item) => Items.Remove(item);
        public void RemoveMedia(MediaAsset media) { MediaRecord = null; Items.RemoveAll(item => item.MediaAssetId == media.Id); }
        public Task SaveChangesAsync(CancellationToken token) => Task.CompletedTask;
    }
}
