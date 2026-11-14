namespace TheDomain.Domain.Events;

public static class EventLifecyclePolicy
{
    public static EventLifecycleState Evaluate(
        EventPublicationStatus publicationStatus,
        DateTimeOffset startAtUtc,
        DateTimeOffset endAtUtc,
        BookingAvailability bookingStatus,
        DateTimeOffset? bookingOpensAtUtc,
        DateTimeOffset? bookingClosesAtUtc,
        string? externalBookingUrl,
        DateTimeOffset now)
    {
        var displayStatus = publicationStatus switch
        {
            EventPublicationStatus.Cancelled => EventDisplayStatus.Cancelled,
            _ when now < startAtUtc => EventDisplayStatus.Upcoming,
            _ when now < endAtUtc => EventDisplayStatus.Live,
            _ => EventDisplayStatus.Finished
        };
        var bookingAvailability = EffectiveBookingAvailability(
            publicationStatus,
            bookingStatus,
            bookingOpensAtUtc,
            bookingClosesAtUtc,
            externalBookingUrl,
            now,
            displayStatus);
        var safeBookingUrl = bookingAvailability == BookingAvailability.Open &&
            HasSafeBookingUrl(externalBookingUrl)
                ? externalBookingUrl
                : null;
        var actionable = bookingAvailability == BookingAvailability.Open && safeBookingUrl is not null;

        return new(
            publicationStatus,
            displayStatus,
            bookingAvailability,
            publicationStatus == EventPublicationStatus.Published,
            publicationStatus is EventPublicationStatus.Published or EventPublicationStatus.Cancelled,
            actionable,
            actionable ? safeBookingUrl : null);
    }

    public static bool IsManualBookingStatus(BookingAvailability status) =>
        status is BookingAvailability.Hidden or BookingAvailability.Open or
            BookingAvailability.Closed or BookingAvailability.SoldOut;

    private static BookingAvailability EffectiveBookingAvailability(
        EventPublicationStatus publicationStatus,
        BookingAvailability bookingStatus,
        DateTimeOffset? bookingOpensAtUtc,
        DateTimeOffset? bookingClosesAtUtc,
        string? externalBookingUrl,
        DateTimeOffset now,
        EventDisplayStatus displayStatus)
    {
        if (publicationStatus == EventPublicationStatus.Cancelled) return BookingAvailability.Closed;
        if (publicationStatus != EventPublicationStatus.Published) return BookingAvailability.Hidden;
        if (displayStatus == EventDisplayStatus.Finished) return BookingAvailability.Closed;
        if (!IsManualBookingStatus(bookingStatus)) return BookingAvailability.Hidden;
        if (bookingStatus != BookingAvailability.Open) return bookingStatus;
        if (!HasSafeBookingUrl(externalBookingUrl)) return BookingAvailability.Hidden;
        if (bookingOpensAtUtc is { } opens && now < opens) return BookingAvailability.NotOpenYet;
        if (bookingClosesAtUtc is { } closes && now >= closes) return BookingAvailability.Closed;
        return BookingAvailability.Open;
    }

    private static bool HasSafeBookingUrl(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
}
