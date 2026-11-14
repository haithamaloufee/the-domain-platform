using TheDomain.Domain.Events;
using TheDomain.Domain.Media;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Application.Events.Contracts;

public sealed record PublicMediaResponse(Guid Id, MediaType MediaType, string Url, string? ThumbnailUrl,
    string? Caption, string? AltText, int? Width, int? Height, decimal? DurationSeconds,
    MediaOrientation Orientation, EventMediaUsage Usage, int SortOrder, bool IsFeatured,
    EventCoverPresentationResponse Presentation, VideoPosterPresentationResponse VideoPoster);
public sealed record PublicEventListResponse(Guid Id, string Slug, string Title, string ShortDescription,
    string EventType, DateTimeOffset StartAtUtc, DateTimeOffset EndAtUtc, string TimeZoneId, string City,
    string VenueName, EventDisplayStatus DisplayStatus, BookingAvailability BookingAvailability,
    string? ExternalBookingUrl, PublicMediaResponse? CoverMedia);
public sealed record PublicEventDetailsResponse(Guid Id, string Slug, string Title, string ShortDescription,
    string LongDescription, string EventType, DateTimeOffset StartAtUtc, DateTimeOffset EndAtUtc,
    string TimeZoneId, string City, string VenueName, string? VenueAddress, string? MapUrl,
    EventDisplayStatus DisplayStatus, BookingAvailability BookingAvailability, string? ExternalBookingUrl,
    IReadOnlyList<PublicMediaResponse> Media, PublicMediaResponse? CoverMedia,
    DateTimeOffset? BookingClosesAtUtc = null);
public sealed record AdminEventResponse(Guid Id, string Slug, string Title, string ShortDescription, string LongDescription,
    string EventType, DateTimeOffset StartAtUtc, DateTimeOffset EndAtUtc, string TimeZoneId, string City,
    string VenueName, string? VenueAddress, string? MapUrl, string? ExternalBookingUrl, bool IsBookingEnabled,
    BookingAvailability BookingStatus, DateTimeOffset? BookingOpensAtUtc, DateTimeOffset? BookingClosesAtUtc, EventPublicationStatus PublicationStatus,
    EventDisplayStatus DisplayStatus, BookingAvailability BookingAvailability, bool IsFeatured, bool ShowOnHomepage,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record GalleryAlbumListResponse(Guid EventId, string EventSlug, string Title,
    DateTimeOffset EventStartAtUtc, string TimeZoneId, string City, string VenueName,
    int MediaCount, int PhotoCount, int VideoCount, PublicMediaResponse CoverMedia);
public sealed record GalleryAlbumDetailsResponse(Guid EventId, string EventSlug, string Title,
    DateTimeOffset EventStartAtUtc, string TimeZoneId, string City, string VenueName,
    IReadOnlyList<PublicMediaResponse> Media);
public sealed record HomepageEventPreviewResponse(
    IReadOnlyList<PublicEventListResponse> CurrentEvents,
    IReadOnlyList<PublicEventListResponse> PreviousEvents,
    IReadOnlyList<GalleryAlbumListResponse> GalleryAlbums);
