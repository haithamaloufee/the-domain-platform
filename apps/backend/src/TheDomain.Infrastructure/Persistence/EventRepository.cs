using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence;

public sealed class EventRepository(TheDomainDbContext dbContext) : IEventRepository, IPublicEventReadRepository
{
    public async Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) => await Query().OrderBy(item => item.StartAtUtc).ToListAsync(cancellationToken);
    public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) => Query().SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) => Query().SingleOrDefaultAsync(item => item.Slug == slug, cancellationToken);
    public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => dbContext.Events.AnyAsync(item => item.Slug == slug && (!excludingId.HasValue || item.Id != excludingId.Value), cancellationToken);
    public void Add(EntertainmentEvent eventEntity) => dbContext.Events.Add(eventEntity);
    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    public async Task<IReadOnlyList<PublicEventSummaryReadModel>> ListPublicAsync(
        PublicEventQueryKind queryKind,
        DateTimeOffset now,
        int limit,
        CancellationToken cancellationToken) =>
        await BuildPublicQuery(queryKind, now, limit).ToListAsync(cancellationToken);

    internal IQueryable<PublicEventSummaryReadModel> BuildPublicQuery(
        PublicEventQueryKind queryKind,
        DateTimeOffset now,
        int limit)
    {
        var query = dbContext.Events.AsNoTracking()
            .Where(item => item.PublicationStatus == EventPublicationStatus.Published);
        query = queryKind switch
        {
            PublicEventQueryKind.Upcoming => query.Where(item => item.EndAtUtc > now),
            PublicEventQueryKind.Featured => query.Where(item =>
                item.EndAtUtc > now && item.IsFeatured),
            PublicEventQueryKind.Previous => query.Where(item => item.EndAtUtc <= now),
            _ => throw new ArgumentOutOfRangeException(nameof(queryKind))
        };

        return ProjectPublicSummaries(query.OrderBy(item => item.StartAtUtc).Take(limit));
    }

    public async Task<HomepageEventPreviewReadModel> GetHomepagePreviewAsync(
        DateTimeOffset now,
        int currentLimit,
        int previousLimit,
        int albumLimit,
        CancellationToken cancellationToken)
    {
        var eventRows = await BuildHomepageEventQuery(now, currentLimit, previousLimit)
            .ToListAsync(cancellationToken);
        var current = eventRows.Where(item => item.EndAtUtc > now)
            .OrderByDescending(item => item.IsFeatured)
            .ThenBy(item => item.StartAtUtc)
            .ToArray();
        var previous = eventRows.Where(item => item.EndAtUtc <= now)
            .OrderBy(item => item.StartAtUtc)
            .ToArray();

        var albums = await BuildHomepageAlbumQuery(albumLimit).ToListAsync(cancellationToken);
        return new(current, previous, albums);
    }

    private IQueryable<EntertainmentEvent> Query() => dbContext.Events.AsSplitQuery()
        .Include(item => item.Media).ThenInclude(link => link.MediaAsset)
        .Include(item => item.Media).ThenInclude(link => link.CustomPosterMediaAsset);

    private static IQueryable<PublicEventSummaryReadModel> ProjectPublicSummaries(
        IQueryable<EntertainmentEvent> query) => query.Select(item => new PublicEventSummaryReadModel(
            item.Id,
            item.Slug,
            item.Title,
            item.ShortDescription,
            item.EventType,
            item.StartAtUtc,
            item.EndAtUtc,
            item.TimeZoneId,
            item.City,
            item.VenueName,
            item.PublicationStatus,
            item.BookingStatus,
            item.BookingOpensAtUtc,
            item.BookingClosesAtUtc,
            item.ExternalBookingUrl,
            item.IsFeatured,
            item.Media
                .Where(link => link.Usage == EventMediaUsage.Cover &&
                    link.MediaAsset.MediaType == MediaType.Image &&
                    link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                    EF.Functions.Like(link.MediaAsset.Url, "https://%"))
                .OrderBy(link => link.SortOrder)
                .ThenBy(link => link.CreatedAtUtc)
                .ThenBy(link => link.Id)
                .Select(link => new PublicEventMediaReadModel(
                    link.MediaAsset.Id,
                    link.MediaAsset.MediaType,
                    link.MediaAsset.Url,
                    link.MediaAsset.ThumbnailUrl,
                    link.MediaAsset.CloudinaryPublicId,
                    link.MediaAsset.Caption,
                    link.MediaAsset.AltText,
                    link.MediaAsset.Width,
                    link.MediaAsset.Height,
                    link.MediaAsset.DurationSeconds,
                    link.MediaAsset.Orientation,
                    link.Usage,
                    link.SortOrder,
                    link.IsFeatured,
                    link.FocalPointX,
                    link.FocalPointY,
                    link.Zoom,
                    link.VideoPosterMode,
                    link.VideoPosterTimestampSeconds,
                    link.CustomPosterMediaAssetId,
                    null))
                .FirstOrDefault()));

    internal IQueryable<PublicEventSummaryReadModel> BuildHomepageEventQuery(
        DateTimeOffset now,
        int currentLimit,
        int previousLimit)
    {
        var visible = dbContext.Events.AsNoTracking().Where(item =>
            item.PublicationStatus == EventPublicationStatus.Published && item.ShowOnHomepage);
        var currentQuery = visible.Where(item => item.EndAtUtc > now)
            .OrderByDescending(item => item.IsFeatured)
            .ThenBy(item => item.StartAtUtc)
            .Take(currentLimit);
        var previousQuery = visible.Where(item => item.EndAtUtc <= now)
            .OrderBy(item => item.StartAtUtc)
            .Take(previousLimit);
        return ProjectPublicSummaries(currentQuery.Concat(previousQuery));
    }

    internal IQueryable<GalleryAlbumReadModel> BuildHomepageAlbumQuery(int albumLimit)
    {
        var eligibleEvents = dbContext.Events.AsNoTracking()
            .Where(item => item.PublicationStatus == EventPublicationStatus.Published)
            .Where(item => item.Media.Any(link =>
                link.Usage == EventMediaUsage.Gallery &&
                link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                EF.Functions.Like(link.MediaAsset.Url, "https://%")))
            .OrderBy(item => item.StartAtUtc)
            .Take(albumLimit);

        return eligibleEvents.Select(item => new GalleryAlbumReadModel(
            item.Id,
            item.Slug,
            item.Title,
            item.StartAtUtc,
            item.TimeZoneId,
            item.City,
            item.VenueName,
            item.Media.Count(link => link.Usage == EventMediaUsage.Gallery &&
                link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                EF.Functions.Like(link.MediaAsset.Url, "https://%")),
            item.Media.Count(link => link.Usage == EventMediaUsage.Gallery &&
                link.MediaAsset.MediaType == MediaType.Image &&
                link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                EF.Functions.Like(link.MediaAsset.Url, "https://%")),
            item.Media.Count(link => link.Usage == EventMediaUsage.Gallery &&
                link.MediaAsset.MediaType == MediaType.Video &&
                link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                EF.Functions.Like(link.MediaAsset.Url, "https://%")),
            item.Media
                .Where(link => link.Usage == EventMediaUsage.Gallery &&
                    link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                    EF.Functions.Like(link.MediaAsset.Url, "https://%"))
                .OrderByDescending(link => link.IsFeatured)
                .ThenBy(link => link.SortOrder)
                .ThenBy(link => link.CreatedAtUtc)
                .ThenBy(link => link.Id)
                .Select(link => new PublicEventMediaReadModel(
                    link.MediaAsset.Id,
                    link.MediaAsset.MediaType,
                    link.MediaAsset.Url,
                    link.MediaAsset.ThumbnailUrl,
                    link.MediaAsset.CloudinaryPublicId,
                    link.MediaAsset.Caption,
                    link.MediaAsset.AltText,
                    link.MediaAsset.Width,
                    link.MediaAsset.Height,
                    link.MediaAsset.DurationSeconds,
                    link.MediaAsset.Orientation,
                    link.Usage,
                    link.SortOrder,
                    link.IsFeatured,
                    link.FocalPointX,
                    link.FocalPointY,
                    link.Zoom,
                    link.VideoPosterMode,
                    link.VideoPosterTimestampSeconds,
                    link.CustomPosterMediaAssetId,
                    link.CustomPosterMediaAsset != null &&
                        link.CustomPosterMediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                        EF.Functions.Like(link.CustomPosterMediaAsset.Url, "https://%")
                            ? link.CustomPosterMediaAsset.Url
                            : null))
                .First()));
    }
}
