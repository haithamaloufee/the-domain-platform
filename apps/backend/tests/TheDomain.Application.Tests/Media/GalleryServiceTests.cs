using System.Reflection;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Application.Caching;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Media;

public sealed class GalleryServiceTests
{
    [Fact]
    public async Task GalleryMutationEvictsGalleryTag()
    {
        var repository = new FakeRepository();
        var collection = repository.AddCollection("Published");
        var cache = new RecordingInvalidator();

        Assert.True((await new GalleryService(repository, new FakeDelivery(), TimeProvider.System, cache)
            .PublishAsync(collection.Id, default)).IsSuccess);
        Assert.Equal([PublicCacheTags.Gallery], Assert.Single(cache.Calls));
    }
    [Fact]
    public async Task PublishAndUnpublishRemainIndependentFromArchive()
    {
        var repository = new FakeRepository(); var collection = repository.AddCollection("Published"); var service = Create(repository);
        Assert.True((await service.PublishAsync(collection.Id, default)).IsSuccess); Assert.True(collection.IsPublishedInGallery);
        Assert.True((await service.UnpublishAsync(collection.Id, default)).IsSuccess); Assert.False(collection.IsPublishedInGallery); Assert.False(collection.IsArchived);
        collection.Archive(DateTimeOffset.UtcNow); Assert.False((await service.PublishAsync(collection.Id, default)).IsSuccess);
    }

    [Fact]
    public async Task ReorderRequiresEveryPublishedCollectionExactlyOnce()
    {
        var repository = new FakeRepository(); var first = repository.AddCollection("First"); var second = repository.AddCollection("Second"); var service = Create(repository);
        await service.PublishAsync(first.Id, default); await service.PublishAsync(second.Id, default);
        Assert.False((await service.ReorderAsync(new([first.Id, first.Id]), default)).IsSuccess);
        Assert.False((await service.ReorderAsync(new([first.Id]), default)).IsSuccess);
        Assert.True((await service.ReorderAsync(new([second.Id, first.Id]), default)).IsSuccess);
        Assert.Equal(0, second.GallerySortOrder); Assert.Equal(1, first.GallerySortOrder);
    }

    [Fact]
    public async Task PresentationValidatesPresetFeaturedMembershipAndEligibility()
    {
        var repository = new FakeRepository(); var collection = repository.AddCollection("Feature"); var approved = repository.AddMedia(collection, MediaType.Image, MediaApprovalStatus.Approved, 0); var hidden = repository.AddMedia(collection, MediaType.Image, MediaApprovalStatus.Hidden, 1); var service = Create(repository);
        Assert.False((await service.SavePresentationAsync(collection.Id, new(null, null, (GalleryLayoutPreset)99, null), default)).IsSuccess);
        Assert.False((await service.SavePresentationAsync(collection.Id, new(null, null, GalleryLayoutPreset.Balanced, Guid.NewGuid()), default)).IsSuccess);
        Assert.False((await service.SavePresentationAsync(collection.Id, new(null, null, GalleryLayoutPreset.Balanced, hidden.Id), default)).IsSuccess);
        Assert.True((await service.SavePresentationAsync(collection.Id, new(" Public ", " Copy ", GalleryLayoutPreset.FeatureFirst, approved.Id), default)).IsSuccess);
        Assert.Equal("Public", collection.GalleryTitle); Assert.Equal(approved.Id, collection.GalleryFeaturedMediaAssetId);
    }

    [Fact]
    public async Task ResetRestoresPresentationDefaults()
    {
        var repository = new FakeRepository(); var collection = repository.AddCollection("Reset"); var service = Create(repository);
        await service.SavePresentationAsync(collection.Id, new("Title", "Description", GalleryLayoutPreset.Compact, null), default);
        Assert.True((await service.ResetPresentationAsync(collection.Id, default)).IsSuccess);
        Assert.Null(collection.GalleryTitle); Assert.Null(collection.GalleryDescription); Assert.Equal(GalleryLayoutPreset.Editorial, collection.GalleryLayoutPreset); Assert.Null(collection.GalleryFeaturedMediaAssetId);
    }

    [Fact]
    public async Task PublicProjectionFiltersAndOrdersWithoutChangingPlaybackUrl()
    {
        var repository = new FakeRepository(); var later = repository.AddCollection("Later"); var first = repository.AddCollection("First");
        var video = repository.AddMedia(first, MediaType.Video, MediaApprovalStatus.Approved, 1); repository.AddMedia(first, MediaType.Image, MediaApprovalStatus.Hidden, 0); repository.AddMedia(later, MediaType.Image, MediaApprovalStatus.Approved, 0);
        later.PublishToGallery(1, DateTimeOffset.UtcNow); first.PublishToGallery(0, DateTimeOffset.UtcNow);
        var result = await Create(repository).GetPublicAsync(default);
        Assert.Equal([first.Id, later.Id], result.Select(item => item.Id)); Assert.Single(result[0].Media);
        Assert.Equal(video.Url, result[0].Media[0].Url); Assert.Equal("https://cdn.example/poster.jpg", result[0].Media[0].PosterUrl); Assert.Equal(1, result[0].Media[0].SortOrder);
    }

    [Fact]
    public async Task PublicProjectionOmitsArchivedAndEmptyCollections()
    {
        var repository = new FakeRepository(); var empty = repository.AddCollection("Empty"); var archived = repository.AddCollection("Archived"); repository.AddMedia(archived, MediaType.Image, MediaApprovalStatus.Approved, 0); empty.PublishToGallery(0, DateTimeOffset.UtcNow); archived.PublishToGallery(1, DateTimeOffset.UtcNow); archived.Archive(DateTimeOffset.UtcNow);
        var service = Create(repository);
        Assert.Empty(await service.GetPublicAsync(default));
        Assert.Null(await service.GetPublicByIdAsync(empty.Id, default));
    }

    private static GalleryService Create(FakeRepository repository) => new(repository, new FakeDelivery(), TimeProvider.System);
    private sealed class RecordingInvalidator : IPublicOutputCacheInvalidator
    {
        public List<string[]> Calls { get; } = [];
        public Task EvictAsync(CancellationToken token, params string[] tags) { Calls.Add(tags); return Task.CompletedTask; }
    }
    private sealed class FakeDelivery : IMediaDeliveryUrlResolver { public string? ResolveThumbnailUrl(MediaType mediaType, string mediaUrl, string? thumbnailUrl, string? storagePublicId) => mediaType == MediaType.Video ? "https://cdn.example/poster.jpg" : thumbnailUrl; public string? ResolveVideoFrameUrl(string mediaUrl, string? storagePublicId, decimal timestampSeconds) => null; }
    private sealed class FakeRepository : IGalleryRepository
    {
        public List<MediaCollection> Collections { get; } = []; public List<MediaCollectionItem> Items { get; } = [];
        public MediaCollection AddCollection(string name) { var item = new MediaCollection(Guid.NewGuid(), name, DateTimeOffset.UtcNow); Collections.Add(item); return item; }
        public MediaAsset AddMedia(MediaCollection collection, MediaType type, MediaApprovalStatus status, int order) { var asset = new MediaAsset(Guid.NewGuid(), "media", "media", type, $"https://cdn.example/{Guid.NewGuid()}", null, 100, 100, type == MediaType.Video ? 10 : null, MediaOrientation.Landscape, null, null, "Alt", status, null, DateTimeOffset.UtcNow); var link = new MediaCollectionItem(collection.Id, asset.Id, order, DateTimeOffset.UtcNow); typeof(MediaCollectionItem).GetProperty(nameof(MediaCollectionItem.MediaAsset), BindingFlags.Instance | BindingFlags.Public)!.SetValue(link, asset); Items.Add(link); return asset; }
        public Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool tracking, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollection>>(Collections);
        public Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token) => Task.FromResult(Collections.SingleOrDefault(item => item.Id == id));
        public Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(Guid collectionId, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollectionItem>>(Items.Where(item => item.CollectionId == collectionId).OrderBy(item => item.SortOrder).ToArray());
        public Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(IReadOnlyCollection<Guid> collectionIds, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollectionItem>>(Items.Where(item => collectionIds.Contains(item.CollectionId)).OrderBy(item => item.CollectionId).ThenBy(item => item.SortOrder).ToArray());
        public Task<IReadOnlyList<MediaCollectionItem>> ListPublicItemsAsync(Guid collectionId, int offset, int limit, CancellationToken token) =>
            Task.FromResult<IReadOnlyList<MediaCollectionItem>>(Items.Where(item => item.CollectionId == collectionId && item.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved)
                .OrderBy(item => item.SortOrder).Skip(offset).Take(limit).ToArray());
        public Task SaveChangesAsync(CancellationToken token) => Task.CompletedTask;
    }
}
