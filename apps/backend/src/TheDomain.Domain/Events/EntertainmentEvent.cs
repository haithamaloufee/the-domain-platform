using TheDomain.Domain.Media;

namespace TheDomain.Domain.Events;

public sealed class EntertainmentEvent
{
    private readonly List<EventMedia> _media = [];
    private EntertainmentEvent() { }

    public EntertainmentEvent(Guid id, string slug, string title, string shortDescription, string longDescription, string eventType,
        DateTimeOffset startAtUtc, DateTimeOffset endAtUtc, string timeZoneId, string city, string venueName,
        string? venueAddress, string? mapUrl, string? externalBookingUrl, bool isBookingEnabled,
        DateTimeOffset? bookingOpensAtUtc, DateTimeOffset? bookingClosesAtUtc, bool isFeatured,
        bool showOnHomepage, DateTimeOffset createdAtUtc)
    {
        Id = id;
        ApplyDetails(slug, title, shortDescription, longDescription, eventType, startAtUtc, endAtUtc, timeZoneId,
            city, venueName, venueAddress, mapUrl, externalBookingUrl, isBookingEnabled, bookingOpensAtUtc,
            bookingClosesAtUtc, isFeatured, showOnHomepage, createdAtUtc);
        PublicationStatus = EventPublicationStatus.Draft;
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string ShortDescription { get; private set; } = string.Empty;
    public string LongDescription { get; private set; } = string.Empty;
    public string EventType { get; private set; } = string.Empty;
    public DateTimeOffset StartAtUtc { get; private set; }
    public DateTimeOffset EndAtUtc { get; private set; }
    public string TimeZoneId { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string VenueName { get; private set; } = string.Empty;
    public string? VenueAddress { get; private set; }
    public string? MapUrl { get; private set; }
    public string? ExternalBookingUrl { get; private set; }
    public bool IsBookingEnabled { get; private set; }
    public DateTimeOffset? BookingOpensAtUtc { get; private set; }
    public DateTimeOffset? BookingClosesAtUtc { get; private set; }
    public EventPublicationStatus PublicationStatus { get; private set; }
    public bool IsFeatured { get; private set; }
    public bool ShowOnHomepage { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public IReadOnlyCollection<EventMedia> Media => _media;

    public EventDisplayStatus GetDisplayStatus(DateTimeOffset now) => PublicationStatus switch
    {
        EventPublicationStatus.Cancelled => EventDisplayStatus.Cancelled,
        _ when now < StartAtUtc => EventDisplayStatus.Upcoming,
        _ when now <= EndAtUtc => EventDisplayStatus.Live,
        _ => EventDisplayStatus.Finished
    };

    public BookingAvailability GetBookingAvailability(DateTimeOffset now)
    {
        if (!IsBookingEnabled || string.IsNullOrWhiteSpace(ExternalBookingUrl)) return BookingAvailability.Hidden;
        if (GetDisplayStatus(now) is EventDisplayStatus.Finished or EventDisplayStatus.Cancelled) return BookingAvailability.Closed;
        if (BookingOpensAtUtc is { } opens && now < opens) return BookingAvailability.NotOpenYet;
        if (BookingClosesAtUtc is { } closes && now > closes) return BookingAvailability.Closed;
        return BookingAvailability.Open;
    }

    public void Update(string slug, string title, string shortDescription, string longDescription, string eventType,
        DateTimeOffset startAtUtc, DateTimeOffset endAtUtc, string timeZoneId, string city, string venueName,
        string? venueAddress, string? mapUrl, string? externalBookingUrl, bool isBookingEnabled,
        DateTimeOffset? bookingOpensAtUtc, DateTimeOffset? bookingClosesAtUtc, bool isFeatured,
        bool showOnHomepage, DateTimeOffset updatedAtUtc) =>
        ApplyDetails(slug, title, shortDescription, longDescription, eventType, startAtUtc, endAtUtc, timeZoneId,
            city, venueName, venueAddress, mapUrl, externalBookingUrl, isBookingEnabled, bookingOpensAtUtc,
            bookingClosesAtUtc, isFeatured, showOnHomepage, updatedAtUtc);

    public void Publish(DateTimeOffset now) { PublicationStatus = EventPublicationStatus.Published; UpdatedAtUtc = now; }
    public void Archive(DateTimeOffset now) { PublicationStatus = EventPublicationStatus.Archived; UpdatedAtUtc = now; }
    public void Cancel(DateTimeOffset now) { PublicationStatus = EventPublicationStatus.Cancelled; UpdatedAtUtc = now; }

    public void AddMedia(EventMedia eventMedia, MediaAsset mediaAsset)
    {
        ArgumentNullException.ThrowIfNull(eventMedia); ArgumentNullException.ThrowIfNull(mediaAsset);
        if (eventMedia.EventId != Id || eventMedia.MediaAssetId != mediaAsset.Id) throw new ArgumentException("Media assignment identifiers do not match the aggregate.", nameof(eventMedia));
        eventMedia.AttachTo(this, mediaAsset); _media.Add(eventMedia);
    }

    private void ApplyDetails(string slug, string title, string shortDescription, string longDescription, string eventType,
        DateTimeOffset startAtUtc, DateTimeOffset endAtUtc, string timeZoneId, string city, string venueName,
        string? venueAddress, string? mapUrl, string? externalBookingUrl, bool isBookingEnabled,
        DateTimeOffset? bookingOpensAtUtc, DateTimeOffset? bookingClosesAtUtc, bool isFeatured,
        bool showOnHomepage, DateTimeOffset updatedAtUtc)
    {
        if (endAtUtc <= startAtUtc) throw new ArgumentException("Event end must be after event start.", nameof(endAtUtc));
        if (bookingOpensAtUtc is not null && bookingClosesAtUtc < bookingOpensAtUtc) throw new ArgumentException("Booking close must not precede booking open.", nameof(bookingClosesAtUtc));
        Slug = slug; Title = title; ShortDescription = shortDescription; LongDescription = longDescription;
        EventType = eventType; StartAtUtc = startAtUtc; EndAtUtc = endAtUtc; TimeZoneId = timeZoneId;
        City = city; VenueName = venueName; VenueAddress = venueAddress; MapUrl = mapUrl;
        ExternalBookingUrl = externalBookingUrl; IsBookingEnabled = isBookingEnabled;
        BookingOpensAtUtc = bookingOpensAtUtc; BookingClosesAtUtc = bookingClosesAtUtc;
        IsFeatured = isFeatured; ShowOnHomepage = showOnHomepage; UpdatedAtUtc = updatedAtUtc;
    }
}
