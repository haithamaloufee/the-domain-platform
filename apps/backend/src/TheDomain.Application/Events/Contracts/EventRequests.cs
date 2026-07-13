namespace TheDomain.Application.Events.Contracts;

public sealed record SaveEventRequest(
    string Slug, string Title, string ShortDescription, string LongDescription, string EventType,
    DateTimeOffset StartAtUtc, DateTimeOffset EndAtUtc, string TimeZoneId, string City, string VenueName,
    string? VenueAddress, string? MapUrl, string? ExternalBookingUrl, bool IsBookingEnabled,
    DateTimeOffset? BookingOpensAtUtc, DateTimeOffset? BookingClosesAtUtc, bool IsFeatured, bool ShowOnHomepage);
