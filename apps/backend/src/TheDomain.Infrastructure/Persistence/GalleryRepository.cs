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
}
