using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;
using TheDomain.Application.Caching;
namespace TheDomain.Application.Media;
public sealed class GalleryService(IGalleryRepository repository, IMediaDeliveryUrlResolver delivery,
    TimeProvider timeProvider, IPublicOutputCacheInvalidator? cache = null) : IGalleryService
{
    private const int PublicMediaPageSize = 18;

    public async Task<IReadOnlyList<GalleryCollectionSummaryResponse>> GetPublicSummariesAsync(CancellationToken token)
    {
        var collections = await GetPublicAsync(token);
        return collections.Select(collection =>
        {
            var photos = collection.Media.Count(media => media.MediaType == MediaType.Image);
            var cover = collection.Media.FirstOrDefault(media => media.Id == collection.FeaturedMediaId);
            return new GalleryCollectionSummaryResponse("collection", collection.Id, collection.Title,
                collection.Description, collection.LayoutPreset, collection.Media.Count, photos,
                collection.Media.Count - photos, cover);
        }).ToArray();
    }

    public async Task<GalleryMediaPageResponse?> GetPublicMediaPageAsync(Guid id, int offset, CancellationToken token)
    {
        var collection = await repository.FindCollectionAsync(id, false, token);
        if (collection is not { IsPublishedInGallery: true, IsArchived: false }) return null;

        var links = await repository.ListPublicItemsAsync(id, offset, PublicMediaPageSize + 1, token);
        if (links.Count == 0 && offset == 0) return null;
        return new(MapPublic(collection, links.Take(PublicMediaPageSize).ToArray()),
            links.Count > PublicMediaPageSize ? offset + PublicMediaPageSize : null);
    }
    public async Task<IReadOnlyList<GalleryAdminCollectionResponse>> GetAdminAsync(CancellationToken token)
    { List<GalleryAdminCollectionResponse> result = []; foreach (var item in await repository.ListCollectionsAsync(false, token)) result.Add(await MapAdmin(item, token)); return result; }
    public async Task<IReadOnlyList<GalleryPublicCollectionResponse>> GetPublicAsync(CancellationToken token)
    {
        var collections = (await repository.ListCollectionsAsync(false, token))
            .Where(item => item.IsPublishedInGallery && !item.IsArchived)
            .OrderBy(item => item.GallerySortOrder).ThenBy(item => item.Id).ToArray();
        var media = (await repository.ListItemsAsync(collections.Select(item => item.Id).ToArray(), token))
            .GroupBy(item => item.CollectionId).ToDictionary(group => group.Key, group => (IReadOnlyList<MediaCollectionItem>)group.ToArray());
        return collections.Select(item => MapPublic(item, media.GetValueOrDefault(item.Id) ?? []))
            .Where(item => item.Media.Count > 0).ToArray();
    }
    public async Task<GalleryPublicCollectionResponse?> GetPublicByIdAsync(Guid id, CancellationToken token)
    { var item = await repository.FindCollectionAsync(id, false, token); if (item is not { IsPublishedInGallery: true, IsArchived: false }) return null; var mapped = await MapPublic(item, token); return mapped.Media.Count > 0 ? mapped : null; }
    public async Task<EventOperationResult<GalleryAdminCollectionResponse>> PublishAsync(Guid id, CancellationToken token)
    { var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return Missing(); if (item.IsArchived) return EventOperationResult.Conflict<GalleryAdminCollectionResponse>("Archived collections cannot be published to the Gallery."); if (!item.IsPublishedInGallery) { var order = (await repository.ListCollectionsAsync(false, token)).Count(value => value.IsPublishedInGallery); item.PublishToGallery(order, timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await Invalidate(token); } return EventOperationResult.Success(await MapAdmin(item, token)); }
    public async Task<EventOperationResult<GalleryAdminCollectionResponse>> UnpublishAsync(Guid id, CancellationToken token)
    { var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return Missing(); item.UnpublishFromGallery(timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await NormalizePublished(token); await Invalidate(token); return EventOperationResult.Success(await MapAdmin(item, token)); }
    public async Task<EventOperationResult<IReadOnlyList<GalleryAdminCollectionResponse>>> ReorderAsync(ReorderGalleryCollectionsRequest request, CancellationToken token)
    { var all = await repository.ListCollectionsAsync(true, token); var published = all.Where(item => item.IsPublishedInGallery && !item.IsArchived).ToArray(); var ids = request.CollectionIds ?? []; if (ids.Count != published.Length || ids.Distinct().Count() != ids.Count || !ids.ToHashSet().SetEquals(published.Select(item => item.Id))) return EventOperationResult.Failure<IReadOnlyList<GalleryAdminCollectionResponse>>("Gallery order must include every published collection exactly once."); var byId = published.ToDictionary(item => item.Id); for (var index = 0; index < ids.Count; index++) byId[ids[index]].SetGallerySortOrder(index); await repository.SaveChangesAsync(token); await Invalidate(token); return EventOperationResult.Success<IReadOnlyList<GalleryAdminCollectionResponse>>(await GetAdminAsync(token)); }
    public async Task<EventOperationResult<GalleryAdminCollectionResponse>> SavePresentationAsync(Guid id, SaveGalleryCollectionPresentationRequest request, CancellationToken token)
    { var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return Missing(); if (!Enum.IsDefined(request.LayoutPreset)) return EventOperationResult.Failure<GalleryAdminCollectionResponse>("Choose a supported Gallery layout."); if (request.Title?.Trim().Length > 120 || request.Description?.Trim().Length > 500) return EventOperationResult.Failure<GalleryAdminCollectionResponse>("Gallery title must be at most 120 characters and description at most 500 characters."); if (request.FeaturedMediaAssetId is { } featured) { var media = (await repository.ListItemsAsync(id, token)).SingleOrDefault(link => link.MediaAssetId == featured)?.MediaAsset; if (media is null) return EventOperationResult.Conflict<GalleryAdminCollectionResponse>("Featured media must belong to this collection."); if (!Eligibility(media).Eligible) return EventOperationResult.Conflict<GalleryAdminCollectionResponse>("Featured media must be publicly eligible."); } item.UpdateGalleryPresentation(request.Title, request.Description, request.LayoutPreset, request.FeaturedMediaAssetId, timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await Invalidate(token); return EventOperationResult.Success(await MapAdmin(item, token)); }
    public async Task<EventOperationResult<GalleryAdminCollectionResponse>> ResetPresentationAsync(Guid id, CancellationToken token)
    { var item = await repository.FindCollectionAsync(id, true, token); if (item is null) return Missing(); item.ResetGalleryPresentation(timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await Invalidate(token); return EventOperationResult.Success(await MapAdmin(item, token)); }
    private async Task NormalizePublished(CancellationToken token) { var items = (await repository.ListCollectionsAsync(true, token)).Where(item => item.IsPublishedInGallery && !item.IsArchived).OrderBy(item => item.GallerySortOrder).ThenBy(item => item.Id).ToArray(); for (var index = 0; index < items.Length; index++) items[index].SetGallerySortOrder(index); await repository.SaveChangesAsync(token); }
    private async Task<GalleryAdminCollectionResponse> MapAdmin(MediaCollection item, CancellationToken token) { var media = (await repository.ListItemsAsync(item.Id, token)).Select(link => MapAdminMedia(link)).ToArray(); return new(item.Id, item.Name, item.IsArchived, item.IsPublishedInGallery, item.GallerySortOrder, item.GalleryTitle, item.GalleryDescription, SafePreset(item.GalleryLayoutPreset), item.GalleryFeaturedMediaAssetId, media.Length, media.Count(value => value.IsPubliclyEligible), media); }
    private async Task<GalleryPublicCollectionResponse> MapPublic(MediaCollection item, CancellationToken token) =>
        MapPublic(item, await repository.ListItemsAsync(item.Id, token));
    private GalleryPublicCollectionResponse MapPublic(MediaCollection item, IReadOnlyList<MediaCollectionItem> links) { var media = links.Where(link => Eligibility(link.MediaAsset).Eligible).Select(link => MapPublicMedia(link)).ToArray(); var featured = item.GalleryFeaturedMediaAssetId is { } id && media.Any(value => value.Id == id) ? id : media.FirstOrDefault()?.Id; return new(item.Id, item.GalleryTitle ?? item.Name, item.GalleryDescription, SafePreset(item.GalleryLayoutPreset), featured, media); }
    private GalleryAdminMediaResponse MapAdminMedia(MediaCollectionItem link) { var eligibility = Eligibility(link.MediaAsset); return new(link.MediaAssetId, link.MediaAsset.OriginalFileName, link.MediaAsset.MediaType, link.MediaAsset.Url, Poster(link.MediaAsset), link.MediaAsset.Caption, link.MediaAsset.AltText, link.MediaAsset.ApprovalStatus, link.MediaAsset.IsArchived, link.SortOrder, eligibility.Eligible, eligibility.Reason); }
    private GalleryPublicMediaResponse MapPublicMedia(MediaCollectionItem link) => new(link.MediaAssetId, link.MediaAsset.MediaType, link.MediaAsset.Url, Poster(link.MediaAsset), link.MediaAsset.Caption, link.MediaAsset.AltText, link.MediaAsset.Orientation, link.MediaAsset.Width, link.MediaAsset.Height, link.MediaAsset.DurationSeconds, link.SortOrder);
    private static (bool Eligible, string? Reason) Eligibility(MediaAsset media) { if (media.ApprovalStatus == MediaApprovalStatus.Draft) return (false, "Draft media is not public."); if (media.ApprovalStatus == MediaApprovalStatus.Hidden) return (false, "Hidden media is not public."); if (media.IsArchived) return (false, "Archived media is excluded from the Gallery."); if (media.MediaType is not (MediaType.Image or MediaType.Video)) return (false, "This media type is not supported."); if (!SafeHttps(media.Url)) return (false, "The delivery URL is missing or unsafe."); return (true, null); }
    private string? Poster(MediaAsset media) => media.MediaType == MediaType.Video ? delivery.ResolveThumbnailUrl(media.MediaType, media.Url, media.ThumbnailUrl, media.CloudinaryPublicId) : null;
    private static bool SafeHttps(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    private static GalleryLayoutPreset SafePreset(GalleryLayoutPreset value) => Enum.IsDefined(value) ? value : GalleryLayoutPreset.Editorial;
    private static EventOperationResult<GalleryAdminCollectionResponse> Missing() => EventOperationResult.NotFound<GalleryAdminCollectionResponse>("Media collection was not found.");
    private async Task Invalidate(CancellationToken token)
    { if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.Gallery); }
}
