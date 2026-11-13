using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Media;
using TheDomain.Domain.Media;
namespace TheDomain.Infrastructure.Persistence;
public sealed class GalleryRepository(TheDomainDbContext db) : IGalleryRepository
{
    public async Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool tracking, CancellationToken token)
    { var query = db.MediaCollections.AsQueryable(); if (!tracking) query = query.AsNoTracking(); return await query.OrderBy(item => item.GallerySortOrder).ThenBy(item => item.Name).ToListAsync(token); }
    public Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token)
    { var query = db.MediaCollections.AsQueryable(); if (!tracking) query = query.AsNoTracking(); return query.SingleOrDefaultAsync(item => item.Id == id, token); }
    public async Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(Guid collectionId, CancellationToken token) => await db.MediaCollectionItems.AsNoTracking().Include(item => item.MediaAsset).Where(item => item.CollectionId == collectionId).OrderBy(item => item.SortOrder).ThenBy(item => item.CreatedAtUtc).ToListAsync(token);
    public async Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(IReadOnlyCollection<Guid> collectionIds, CancellationToken token) =>
        collectionIds.Count == 0 ? [] : await db.MediaCollectionItems.AsNoTracking().Include(item => item.MediaAsset)
            .Where(item => collectionIds.Contains(item.CollectionId)).OrderBy(item => item.CollectionId)
            .ThenBy(item => item.SortOrder).ThenBy(item => item.CreatedAtUtc).ToListAsync(token);
    public Task SaveChangesAsync(CancellationToken token) => db.SaveChangesAsync(token);

    public async Task<IReadOnlyList<MediaCollectionItem>> ListPublicItemsAsync(Guid collectionId, int offset, int limit, CancellationToken token) =>
        await PublicItems().Include(item => item.MediaAsset).Where(item => item.CollectionId == collectionId)
            .OrderBy(item => item.SortOrder).ThenBy(item => item.CreatedAtUtc).ThenBy(item => item.MediaAssetId)
            .Skip(offset).Take(limit).ToListAsync(token);

    public async Task<IReadOnlyList<PublicGalleryCollectionRead>> ListPublicSummariesAsync(CancellationToken token)
    {
        var media = PublicItems().Include(item => item.MediaAsset);
        var rows = await db.MediaCollections.AsNoTracking()
            .Where(collection => collection.IsPublishedInGallery && !collection.IsArchived)
            .OrderBy(collection => collection.GallerySortOrder).ThenBy(collection => collection.Id)
            .Select(collection => new
            {
                collection.Id,
                Title = collection.GalleryTitle ?? collection.Name,
                Description = collection.GalleryDescription,
                collection.GalleryLayoutPreset,
                Photos = media.Count(item => item.CollectionId == collection.Id && item.MediaAsset.MediaType == MediaType.Image),
                Videos = media.Count(item => item.CollectionId == collection.Id && item.MediaAsset.MediaType == MediaType.Video),
                Cover = media.Where(item => item.CollectionId == collection.Id)
                    .OrderByDescending(item => item.MediaAssetId == collection.GalleryFeaturedMediaAssetId)
                    .ThenBy(item => item.SortOrder).ThenBy(item => item.CreatedAtUtc).ThenBy(item => item.MediaAssetId)
                    .FirstOrDefault()
            }).ToListAsync(token);
        return rows.Where(row => row.Cover is not null)
            .Select(row => new PublicGalleryCollectionRead(row.Id, row.Title, row.Description,
                row.GalleryLayoutPreset, row.Photos, row.Videos, row.Cover)).ToArray();
    }

    private IQueryable<MediaCollectionItem> PublicItems() => db.MediaCollectionItems.AsNoTracking()
        .Where(item => !item.MediaAsset.IsArchived && item.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
            (item.MediaAsset.MediaType == MediaType.Image || item.MediaAsset.MediaType == MediaType.Video) &&
            EF.Functions.ILike(item.MediaAsset.Url, "https://%"));
}
