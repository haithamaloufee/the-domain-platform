using TheDomain.Application.Events;
using TheDomain.Application.Caching;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public sealed class MediaOrganizationService(IMediaOrganizationRepository repository, IMediaStorageService storage,
    TimeProvider timeProvider, IMediaDeliveryUrlResolver? delivery = null,
    IPublicOutputCacheInvalidator? cache = null) : IMediaOrganizationService
{
    public async Task<IReadOnlyList<MediaCollectionResponse>> ListCollectionsAsync(bool includeArchived, CancellationToken token) =>
        (await repository.ListCollectionsAsync(includeArchived, token)).Select(MapCollection).ToArray();
    public async Task<IReadOnlyList<MediaCollectionItemResponse>?> GetCollectionItemsAsync(Guid id, CancellationToken token) =>
        await repository.FindCollectionAsync(id, false, token) is null ? null : await MapItems(id, token);
    public async Task<EventOperationResult<MediaCollectionResponse>> CreateCollectionAsync(SaveMediaCollectionRequest request, CancellationToken token)
    {
        var name = request.Name?.Trim() ?? string.Empty;
        if (name.Length is < 1 or > 120) return EventOperationResult.Failure<MediaCollectionResponse>("Collection name must be between 1 and 120 characters.");
        if (await repository.CollectionNameExistsAsync(name, null, token)) return EventOperationResult.Conflict<MediaCollectionResponse>("A collection with this name already exists.");
        var item = new MediaCollection(Guid.NewGuid(), name, timeProvider.GetUtcNow()); repository.AddCollection(item);
        await repository.SaveChangesAsync(token); await InvalidateCollection(token); return EventOperationResult.Success(MapCollection(item));
    }
    public async Task<EventOperationResult<MediaCollectionResponse>> RenameCollectionAsync(Guid id, SaveMediaCollectionRequest request, CancellationToken token)
    {
        var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return MissingCollection();
        var name = request.Name?.Trim() ?? string.Empty;
        if (name.Length is < 1 or > 120) return EventOperationResult.Failure<MediaCollectionResponse>("Collection name must be between 1 and 120 characters.");
        if (await repository.CollectionNameExistsAsync(name, id, token)) return EventOperationResult.Conflict<MediaCollectionResponse>("A collection with this name already exists.");
        item.Rename(name, timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await InvalidateCollection(token); return EventOperationResult.Success(MapCollection(item));
    }
    public Task<EventOperationResult<MediaCollectionResponse>> ArchiveCollectionAsync(Guid id, CancellationToken token) => ChangeCollection(id, true, token);
    public Task<EventOperationResult<MediaCollectionResponse>> RestoreCollectionAsync(Guid id, CancellationToken token) => ChangeCollection(id, false, token);
    public async Task<EventOperationResult<MediaCollectionResponse>> DeleteCollectionAsync(Guid id, CancellationToken token)
    {
        var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return MissingCollection();
        if (!item.IsArchived) return EventOperationResult.Failure<MediaCollectionResponse>("Archive the collection before deleting it.");
        var response = MapCollection(item); repository.RemoveCollection(item); await repository.SaveChangesAsync(token); await InvalidateCollection(token); return EventOperationResult.Success(response);
    }
    public async Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> AddToCollectionAsync(Guid id, AddMediaToCollectionRequest request, CancellationToken token)
    {
        var collection = await repository.FindCollectionAsync(id, true, token); if (collection is null) return MissingItems();
        if (collection.IsArchived) return EventOperationResult.Failure<IReadOnlyList<MediaCollectionItemResponse>>("Restore the collection before adding media.");
        if (await repository.FindMediaAsync(request.MediaAssetId, token) is null) return EventOperationResult.NotFound<IReadOnlyList<MediaCollectionItemResponse>>("Media asset was not found.");
        var items = await repository.ListCollectionItemsAsync(id, true, token);
        if (items.All(item => item.MediaAssetId != request.MediaAssetId))
        { repository.AddCollectionItem(new(id, request.MediaAssetId, items.Count, timeProvider.GetUtcNow())); await repository.SaveChangesAsync(token); await InvalidateCollection(token); }
        return EventOperationResult.Success<IReadOnlyList<MediaCollectionItemResponse>>(await MapItems(id, token));
    }
    public async Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> RemoveFromCollectionAsync(Guid id, Guid mediaAssetId, CancellationToken token)
    {
        if (await repository.FindCollectionAsync(id, true, token) is null) return MissingItems();
        var items = await repository.ListCollectionItemsAsync(id, true, token); var target = items.SingleOrDefault(item => item.MediaAssetId == mediaAssetId);
        if (target is null) return EventOperationResult.NotFound<IReadOnlyList<MediaCollectionItemResponse>>("Collection membership was not found.");
        repository.RemoveCollectionItem(target); Normalize(items.Where(item => item.MediaAssetId != mediaAssetId)); await repository.SaveChangesAsync(token); await InvalidateCollection(token);
        return EventOperationResult.Success<IReadOnlyList<MediaCollectionItemResponse>>(await MapItems(id, token));
    }
    public async Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> ReorderCollectionAsync(Guid id, ReorderMediaCollectionRequest request, CancellationToken token)
    {
        if (await repository.FindCollectionAsync(id, true, token) is null) return MissingItems();
        var items = await repository.ListCollectionItemsAsync(id, true, token); var ids = request.MediaAssetIds ?? [];
        if (ids.Count != items.Count || ids.Distinct().Count() != ids.Count || !ids.ToHashSet().SetEquals(items.Select(item => item.MediaAssetId)))
            return EventOperationResult.Failure<IReadOnlyList<MediaCollectionItemResponse>>("Reorder must include every collection media identifier exactly once.");
        var byId = items.ToDictionary(item => item.MediaAssetId); for (var index = 0; index < ids.Count; index++) byId[ids[index]].SetSortOrder(index);
        await repository.SaveChangesAsync(token); await InvalidateCollection(token); return EventOperationResult.Success<IReadOnlyList<MediaCollectionItemResponse>>(await MapItems(id, token));
    }
    public Task<EventOperationResult<AdminMediaResponse>> ArchiveMediaAsync(Guid id, CancellationToken token) => ChangeMediaArchive(id, true, token);
    public Task<EventOperationResult<AdminMediaResponse>> RestoreMediaAsync(Guid id, CancellationToken token) => ChangeMediaArchive(id, false, token);
    public Task<MediaUsageResponse?> GetUsageAsync(Guid id, CancellationToken token) => repository.GetUsageAsync(id, token);
    public async Task<EventOperationResult<PermanentDeleteMediaResponse>> PermanentlyDeleteMediaAsync(Guid id, PermanentDeleteMediaRequest request, CancellationToken token)
    {
        var media = await repository.FindMediaAsync(id, token); if (media is null) return EventOperationResult.NotFound<PermanentDeleteMediaResponse>("Media asset was not found.");
        if (!media.IsArchived) return EventOperationResult.Failure<PermanentDeleteMediaResponse>("Archive the media before permanently deleting it.");
        if (!string.Equals(request.Confirmation?.Trim(), media.OriginalFileName, StringComparison.Ordinal))
            return EventOperationResult.Failure<PermanentDeleteMediaResponse>("Type the exact original filename to confirm permanent deletion.");
        var usage = await repository.GetUsageAsync(id, token); if (usage is null || !usage.CanPermanentlyDelete)
            return EventOperationResult.Conflict<PermanentDeleteMediaResponse>("Media used by an event, poster, or branding setting cannot be permanently deleted.");
        if (!string.IsNullOrWhiteSpace(media.CloudinaryPublicId)) await storage.DeleteAsync(media.CloudinaryPublicId, media.MediaType, token);
        repository.RemoveMedia(media); await repository.SaveChangesAsync(token); await InvalidateMedia(token);
        return EventOperationResult.Success(new PermanentDeleteMediaResponse(media.Id, media.OriginalFileName));
    }
    private async Task<EventOperationResult<MediaCollectionResponse>> ChangeCollection(Guid id, bool archive, CancellationToken token)
    { var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return MissingCollection(); if (archive) item.Archive(timeProvider.GetUtcNow()); else item.Restore(timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await InvalidateCollection(token); return EventOperationResult.Success(MapCollection(item)); }
    private async Task<EventOperationResult<AdminMediaResponse>> ChangeMediaArchive(Guid id, bool archive, CancellationToken token)
    { var item = await repository.FindMediaAsync(id, token); if (item is null) return EventOperationResult.NotFound<AdminMediaResponse>("Media asset was not found."); if (archive) item.Archive(timeProvider.GetUtcNow()); else item.Restore(timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await InvalidateMedia(token); return EventOperationResult.Success(MapMedia(item)); }
    private Task InvalidateCollection(CancellationToken token) => cache?.EvictAsync(token,
        PublicCacheTags.Gallery, PublicCacheTags.Media) ?? Task.CompletedTask;
    private Task InvalidateMedia(CancellationToken token) => cache?.EvictAsync(token,
        PublicCacheTags.Media) ?? Task.CompletedTask;
    private async Task<IReadOnlyList<MediaCollectionItemResponse>> MapItems(Guid id, CancellationToken token)
    {
        List<MediaCollectionItemResponse> result = [];
        foreach (var item in await repository.ListCollectionItemsAsync(id, false, token))
        {
            var media = item.MediaAsset ?? await repository.FindMediaAsync(item.MediaAssetId, token);
            if (media is not null) result.Add(new(item.MediaAssetId, item.SortOrder, MapList(media)));
        }
        return result;
    }
    private MediaCollectionResponse MapCollection(MediaCollection item) => new(item.Id, item.Name, item.IsArchived, item.Items.Count, item.CreatedAtUtc, item.UpdatedAtUtc, item.ArchivedAtUtc);
    private AdminMediaResponse MapMedia(MediaAsset item) => new(item.Id, item.FileName, item.OriginalFileName, item.MediaType, item.Url, Thumbnail(item), item.Width, item.Height, item.DurationSeconds, item.Orientation, item.Category, item.Caption, item.AltText, item.ApprovalStatus, item.IsArchived, item.ArchivedAtUtc, item.CreatedAtUtc, item.UpdatedAtUtc);
    private AdminMediaListItemResponse MapList(MediaAsset item) => new(item.Id, item.FileName, item.OriginalFileName, item.MediaType, item.Url, Thumbnail(item), item.Orientation, item.Category, item.Caption, item.AltText, item.ApprovalStatus, item.IsArchived, item.ArchivedAtUtc, item.CreatedAtUtc);
    private string? Thumbnail(MediaAsset item) => delivery?.ResolveThumbnailUrl(item.MediaType, item.Url, item.ThumbnailUrl, item.CloudinaryPublicId) ?? item.ThumbnailUrl;
    private static void Normalize(IEnumerable<MediaCollectionItem> items) { var index = 0; foreach (var item in items.OrderBy(item => item.SortOrder).ThenBy(item => item.CreatedAtUtc)) item.SetSortOrder(index++); }
    private static EventOperationResult<MediaCollectionResponse> MissingCollection() => EventOperationResult.NotFound<MediaCollectionResponse>("Media collection was not found.");
    private static EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>> MissingItems() => EventOperationResult.NotFound<IReadOnlyList<MediaCollectionItemResponse>>("Media collection was not found.");
}
