using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence;

public sealed class MediaRepository(TheDomainDbContext dbContext) : IMediaRepository
{
    public async Task<(IReadOnlyList<MediaAsset> Items, int TotalCount)> SearchAsync(MediaListQuery query, CancellationToken token)
    {
        IQueryable<MediaAsset> databaseQuery = dbContext.MediaAssets.AsNoTracking();
        if (Enum.TryParse<MediaType>(query.MediaType, true, out var type)) databaseQuery = databaseQuery.Where(item => item.MediaType == type);
        if (Enum.TryParse<MediaApprovalStatus>(query.ApprovalStatus, true, out var approval)) databaseQuery = databaseQuery.Where(item => item.ApprovalStatus == approval);
        if (Enum.TryParse<MediaOrientation>(query.Orientation, true, out var orientation)) databaseQuery = databaseQuery.Where(item => item.Orientation == orientation);
        if (!string.IsNullOrWhiteSpace(query.Category)) databaseQuery = databaseQuery.Where(item => item.Category == query.Category);
        if (!string.IsNullOrWhiteSpace(query.Search)) databaseQuery = databaseQuery.Where(item => item.FileName.Contains(query.Search) || (item.Caption != null && item.Caption.Contains(query.Search)));
        if (query.EventId is { } eventId) databaseQuery = databaseQuery.Where(item => dbContext.EventMedia.Any(link => link.MediaAssetId == item.Id && link.EventId == eventId));
        if (Enum.TryParse<EventMediaUsage>(query.Usage, true, out var usage)) databaseQuery = databaseQuery.Where(item => dbContext.EventMedia.Any(link => link.MediaAssetId == item.Id && link.Usage == usage));
        var count = await databaseQuery.CountAsync(token);
        var items = await databaseQuery.OrderByDescending(item => item.CreatedAtUtc).Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(token);
        return (items, count);
    }
    public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) => dbContext.MediaAssets.SingleOrDefaultAsync(item => item.Id == id, token);
    public Task<EntertainmentEvent?> FindEventAsync(Guid id, CancellationToken token) => dbContext.Events.SingleOrDefaultAsync(item => item.Id == id, token);
    public Task<EventMedia?> FindEventMediaAsync(Guid eventId, Guid eventMediaId, CancellationToken token) => dbContext.EventMedia.SingleOrDefaultAsync(item => item.EventId == eventId && item.Id == eventMediaId, token);
    public Task<bool> AssignmentExistsAsync(Guid eventId, Guid mediaAssetId, EventMediaUsage usage, Guid? excludingId, CancellationToken token) => dbContext.EventMedia.AnyAsync(item => item.EventId == eventId && item.MediaAssetId == mediaAssetId && item.Usage == usage && (!excludingId.HasValue || item.Id != excludingId.Value), token);
    public void AddMedia(MediaAsset media) => dbContext.MediaAssets.Add(media);
    public void AddEventMedia(EventMedia eventMedia) => dbContext.EventMedia.Add(eventMedia);
    public void RemoveEventMedia(EventMedia eventMedia) => dbContext.EventMedia.Remove(eventMedia);
    public Task SaveChangesAsync(CancellationToken token) => dbContext.SaveChangesAsync(token);
}
