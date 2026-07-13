using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Events.Contracts;

public sealed record PublicMediaResponse(Guid Id, MediaType MediaType, string Url, string? ThumbnailUrl, string? AltText, EventMediaUsage Usage, int SortOrder, bool IsFeatured);
public sealed record PublicEventResponse(Guid Id, string Slug, string Title, string ShortDescription, string EventType,
    DateTimeOffset StartAtUtc, DateTimeOffset EndAtUtc, string TimeZoneId, string City, string VenueName,
    EventDisplayStatus DisplayStatus, BookingAvailability BookingAvailability, string? ExternalBookingUrl,
    IReadOnlyList<PublicMediaResponse> Media);
public sealed record AdminEventResponse(Guid Id, string Slug, string Title, string ShortDescription, string LongDescription,
    string EventType, DateTimeOffset StartAtUtc, DateTimeOffset EndAtUtc, string TimeZoneId, string City,
    string VenueName, string? VenueAddress, string? MapUrl, string? ExternalBookingUrl, bool IsBookingEnabled,
    DateTimeOffset? BookingOpensAtUtc, DateTimeOffset? BookingClosesAtUtc, EventPublicationStatus PublicationStatus,
    bool IsFeatured, bool ShowOnHomepage, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record GalleryAlbumResponse(Guid EventId, string EventSlug, string Title, DateTimeOffset EventStartAtUtc, IReadOnlyList<PublicMediaResponse> Media);
