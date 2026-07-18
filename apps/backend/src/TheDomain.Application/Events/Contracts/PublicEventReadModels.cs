using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Events.Contracts;

public enum PublicEventQueryKind
{
    Upcoming,
    Featured,
    Previous
}

public sealed record PublicEventMediaReadModel(
    Guid Id,
    MediaType MediaType,
    string Url,
    string? ThumbnailUrl,
    string? CloudinaryPublicId,
    string? Caption,
    string? AltText,
    int? Width,
    int? Height,
    decimal? DurationSeconds,
    MediaOrientation Orientation,
    EventMediaUsage Usage,
    int SortOrder,
    bool IsFeatured,
    double FocalPointX,
    double FocalPointY,
    double Zoom,
    VideoPosterMode VideoPosterMode,
    decimal? VideoPosterTimestampSeconds,
    Guid? CustomPosterMediaAssetId,
    string? CustomPosterUrl);

public sealed record PublicEventSummaryReadModel(
    Guid Id,
    string Slug,
    string Title,
    string ShortDescription,
    string EventType,
    DateTimeOffset StartAtUtc,
    DateTimeOffset EndAtUtc,
    string TimeZoneId,
    string City,
    string VenueName,
    EventPublicationStatus PublicationStatus,
    BookingAvailability BookingStatus,
    DateTimeOffset? BookingOpensAtUtc,
    DateTimeOffset? BookingClosesAtUtc,
    string? ExternalBookingUrl,
    bool IsFeatured,
    PublicEventMediaReadModel? CoverMedia);

public sealed record GalleryAlbumReadModel(
    Guid EventId,
    string EventSlug,
    string Title,
    DateTimeOffset EventStartAtUtc,
    string TimeZoneId,
    string City,
    string VenueName,
    int MediaCount,
    int PhotoCount,
    int VideoCount,
    PublicEventMediaReadModel CoverMedia);

public sealed record HomepageEventPreviewReadModel(
    IReadOnlyList<PublicEventSummaryReadModel> CurrentEvents,
    IReadOnlyList<PublicEventSummaryReadModel> PreviousEvents,
    IReadOnlyList<GalleryAlbumReadModel> GalleryAlbums);
