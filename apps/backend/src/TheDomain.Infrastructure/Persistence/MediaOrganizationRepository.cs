using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence;

public sealed class MediaOrganizationRepository(TheDomainDbContext dbContext) : IMediaOrganizationRepository
{
    public async Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool includeArchived, CancellationToken token) =>
        await dbContext.MediaCollections.AsNoTracking().Include(item => item.Items)
            .Where(item => includeArchived || !item.IsArchived).OrderBy(item => item.Name).ToListAsync(token);
    public Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token)
    {
        var query = dbContext.MediaCollections.Include(item => item.Items).AsQueryable();
        if (!tracking) query = query.AsNoTracking();
        return query.SingleOrDefaultAsync(item => item.Id == id, token);
    }
    public Task<bool> CollectionNameExistsAsync(string name, Guid? excludingId, CancellationToken token)
    {
        var normalized = name.Trim();
        return dbContext.MediaCollections.AnyAsync(item => item.Name == normalized &&
            (!excludingId.HasValue || item.Id != excludingId.Value), token);
    }
    public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) =>
        dbContext.MediaAssets.SingleOrDefaultAsync(item => item.Id == id, token);
    public async Task<IReadOnlyList<MediaCollectionItem>> ListCollectionItemsAsync(Guid collectionId, bool tracking, CancellationToken token)
    {
        var query = dbContext.MediaCollectionItems.Include(item => item.MediaAsset).Where(item => item.CollectionId == collectionId);
        if (!tracking) query = query.AsNoTracking();
        return await query.OrderBy(item => item.SortOrder).ThenBy(item => item.CreatedAtUtc).ToListAsync(token);
    }
    public async Task<MediaUsageResponse?> GetUsageAsync(Guid mediaAssetId, CancellationToken token)
    {
        if (!await dbContext.MediaAssets.AnyAsync(item => item.Id == mediaAssetId, token)) return null;
        var assignments = await dbContext.EventMedia.AsNoTracking().Where(item => item.MediaAssetId == mediaAssetId)
            .Select(item => new MediaUsageEventResponse(item.EventId, item.Event.Title, item.Usage, false)).ToListAsync(token);
        var posters = await dbContext.EventMedia.AsNoTracking().Where(item => item.CustomPosterMediaAssetId == mediaAssetId)
            .Select(item => new MediaUsageEventResponse(item.EventId, item.Event.Title, item.Usage, true)).ToListAsync(token);
        var collections = await dbContext.MediaCollectionItems.AsNoTracking().Where(item => item.MediaAssetId == mediaAssetId)
            .Select(item => new MediaCollectionResponse(item.Collection.Id, item.Collection.Name, item.Collection.IsArchived,
                item.Collection.Items.Count, item.Collection.CreatedAtUtc, item.Collection.UpdatedAtUtc, item.Collection.ArchivedAtUtc))
            .OrderBy(item => item.Name).ToListAsync(token);
        return new(mediaAssetId, assignments.Concat(posters).ToArray(), collections, assignments.Count == 0 && posters.Count == 0);
    }
    public void AddCollection(MediaCollection collection) => dbContext.MediaCollections.Add(collection);
    public void AddCollectionItem(MediaCollectionItem item) => dbContext.MediaCollectionItems.Add(item);
    public void RemoveCollection(MediaCollection collection) => dbContext.MediaCollections.Remove(collection);
    public void RemoveCollectionItem(MediaCollectionItem item) => dbContext.MediaCollectionItems.Remove(item);
    public void RemoveMedia(MediaAsset media) => dbContext.MediaAssets.Remove(media);
    public Task SaveChangesAsync(CancellationToken token) => dbContext.SaveChangesAsync(token);
}
