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
        bool showOnHomepage, DateTimeOffset createdAtUtc, BookingAvailability? bookingStatus = null)
    {
        Id = id;
        ApplyDetails(slug, title, shortDescription, longDescription, eventType, startAtUtc, endAtUtc, timeZoneId,
            city, venueName, venueAddress, mapUrl, externalBookingUrl, isBookingEnabled, bookingOpensAtUtc,
            bookingClosesAtUtc, isFeatured, showOnHomepage, createdAtUtc, bookingStatus);
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
    public BookingAvailability BookingStatus { get; private set; }
    public bool IsBookingEnabled => BookingStatus == BookingAvailability.Open;
    public DateTimeOffset? BookingOpensAtUtc { get; private set; }
    public DateTimeOffset? BookingClosesAtUtc { get; private set; }
    public EventPublicationStatus PublicationStatus { get; private set; }
    public bool IsFeatured { get; private set; }
    public bool ShowOnHomepage { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public IReadOnlyCollection<EventMedia> Media => _media;

    public EventLifecycleState EvaluateLifecycle(DateTimeOffset now)
    {
        var displayStatus = PublicationStatus switch
        {
            EventPublicationStatus.Cancelled => EventDisplayStatus.Cancelled,
            _ when now < StartAtUtc => EventDisplayStatus.Upcoming,
            _ when now < EndAtUtc => EventDisplayStatus.Live,
            _ => EventDisplayStatus.Finished
        };
        var bookingAvailability = EffectiveBookingAvailability(now, displayStatus);
        var safeBookingUrl = bookingAvailability == BookingAvailability.Open && HasSafeBookingUrl()
            ? ExternalBookingUrl
            : null;
        var actionable = bookingAvailability == BookingAvailability.Open && safeBookingUrl is not null;
        return new(
            PublicationStatus,
            displayStatus,
            bookingAvailability,
            PublicationStatus == EventPublicationStatus.Published,
            PublicationStatus is EventPublicationStatus.Published or EventPublicationStatus.Cancelled,
            actionable,
            actionable ? safeBookingUrl : null);
    }

    public EventDisplayStatus GetDisplayStatus(DateTimeOffset now) => EvaluateLifecycle(now).DisplayStatus;
    public BookingAvailability GetBookingAvailability(DateTimeOffset now) => EvaluateLifecycle(now).BookingAvailability;

    public void Update(string slug, string title, string shortDescription, string longDescription, string eventType,
        DateTimeOffset startAtUtc, DateTimeOffset endAtUtc, string timeZoneId, string city, string venueName,
        string? venueAddress, string? mapUrl, string? externalBookingUrl, bool isBookingEnabled,
        DateTimeOffset? bookingOpensAtUtc, DateTimeOffset? bookingClosesAtUtc, bool isFeatured,
        bool showOnHomepage, DateTimeOffset updatedAtUtc, BookingAvailability? bookingStatus = null) =>
        ApplyDetails(slug, title, shortDescription, longDescription, eventType, startAtUtc, endAtUtc, timeZoneId,
            city, venueName, venueAddress, mapUrl, externalBookingUrl, isBookingEnabled, bookingOpensAtUtc,
            bookingClosesAtUtc, isFeatured, showOnHomepage, updatedAtUtc, bookingStatus);

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
        bool showOnHomepage, DateTimeOffset updatedAtUtc, BookingAvailability? bookingStatus)
    {
        if (endAtUtc <= startAtUtc) throw new ArgumentException("Event end must be after event start.", nameof(endAtUtc));
        if (bookingOpensAtUtc is not null && bookingClosesAtUtc < bookingOpensAtUtc) throw new ArgumentException("Booking close must not precede booking open.", nameof(bookingClosesAtUtc));
        var manualBookingStatus = bookingStatus ??
            (isBookingEnabled ? BookingAvailability.Open : BookingAvailability.Hidden);
        if (!IsManualBookingStatus(manualBookingStatus))
            throw new ArgumentOutOfRangeException(nameof(bookingStatus), "Booking status must be Hidden, Open, Closed, or SoldOut.");
        Slug = slug; Title = title; ShortDescription = shortDescription; LongDescription = longDescription;
        EventType = eventType; StartAtUtc = startAtUtc.ToUniversalTime(); EndAtUtc = endAtUtc.ToUniversalTime(); TimeZoneId = timeZoneId;
        City = city; VenueName = venueName; VenueAddress = venueAddress; MapUrl = mapUrl;
        ExternalBookingUrl = externalBookingUrl; BookingStatus = manualBookingStatus;
        BookingOpensAtUtc = bookingOpensAtUtc?.ToUniversalTime(); BookingClosesAtUtc = bookingClosesAtUtc?.ToUniversalTime();
        IsFeatured = isFeatured; ShowOnHomepage = showOnHomepage; UpdatedAtUtc = updatedAtUtc;
    }

    public static bool IsManualBookingStatus(BookingAvailability status) =>
        status is BookingAvailability.Hidden or BookingAvailability.Open or
            BookingAvailability.Closed or BookingAvailability.SoldOut;

    private BookingAvailability EffectiveBookingAvailability(DateTimeOffset now, EventDisplayStatus displayStatus)
    {
        if (PublicationStatus == EventPublicationStatus.Cancelled) return BookingAvailability.Closed;
        if (PublicationStatus != EventPublicationStatus.Published) return BookingAvailability.Hidden;
        if (displayStatus == EventDisplayStatus.Finished) return BookingAvailability.Closed;
        if (!IsManualBookingStatus(BookingStatus)) return BookingAvailability.Hidden;
        if (BookingStatus != BookingAvailability.Open) return BookingStatus;
        if (!HasSafeBookingUrl()) return BookingAvailability.Hidden;
        if (BookingOpensAtUtc is { } opens && now < opens) return BookingAvailability.NotOpenYet;
        if (BookingClosesAtUtc is { } closes && now >= closes) return BookingAvailability.Closed;
        return BookingAvailability.Open;
    }

    private bool HasSafeBookingUrl() =>
        Uri.TryCreate(ExternalBookingUrl, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps;
}
