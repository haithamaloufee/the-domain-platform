namespace TheDomain.Domain.Events;

public readonly record struct EventLifecycleState(
    EventPublicationStatus PublicationStatus,
    EventDisplayStatus DisplayStatus,
    BookingAvailability BookingAvailability,
    bool IsPublicCollectionVisible,
    bool IsPublicDetailVisible,
    bool IsBookingActionable,
    string? SafeBookingUrl);
