using TheDomain.Domain.Events;

namespace TheDomain.Application.Tests.Events;

public sealed class EventRulesTests
{
    private static readonly DateTimeOffset Start = new(2026, 8, 1, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset End = Start.AddHours(2);

    [Fact]
    public void DisplayBoundariesAreExact()
    {
        var item = Published(BookingAvailability.Hidden);

        Assert.Equal(EventDisplayStatus.Upcoming, item.GetDisplayStatus(Start.AddTicks(-1)));
        Assert.Equal(EventDisplayStatus.Live, item.GetDisplayStatus(Start));
        Assert.Equal(EventDisplayStatus.Live, item.GetDisplayStatus(End.AddTicks(-1)));
        Assert.Equal(EventDisplayStatus.Finished, item.GetDisplayStatus(End));
    }

    [Fact]
    public void BookingWindowBoundariesAreExact()
    {
        var opens = Start.AddHours(-2);
        var closes = Start.AddHours(1);
        var item = Published(BookingAvailability.Open, "https://tickets.example.com", opens, closes);

        Assert.Equal(BookingAvailability.NotOpenYet, item.GetBookingAvailability(opens.AddTicks(-1)));
        Assert.Equal(BookingAvailability.Open, item.GetBookingAvailability(opens));
        Assert.Equal(BookingAvailability.Open, item.GetBookingAvailability(closes.AddTicks(-1)));
        Assert.Equal(BookingAvailability.Closed, item.GetBookingAvailability(closes));
    }

    [Theory]
    [InlineData(BookingAvailability.Hidden)]
    [InlineData(BookingAvailability.Closed)]
    [InlineData(BookingAvailability.SoldOut)]
    public void ManualNonOpenBookingStatesRemainNonActionable(BookingAvailability status)
    {
        var state = Published(status).EvaluateLifecycle(Start.AddMinutes(-1));

        Assert.Equal(status, state.BookingAvailability);
        Assert.False(state.IsBookingActionable);
        Assert.Null(state.SafeBookingUrl);
    }

    [Fact]
    public void PublishedOpenBookingWithHttpsUrlIsActionable()
    {
        var state = Published(BookingAvailability.Open, "https://tickets.example.com")
            .EvaluateLifecycle(Start.AddMinutes(-1));

        Assert.Equal(BookingAvailability.Open, state.BookingAvailability);
        Assert.True(state.IsBookingActionable);
        Assert.Equal("https://tickets.example.com", state.SafeBookingUrl);
    }

    [Fact]
    public void UnsafeStoredUrlCannotBecomeActionable()
    {
        var state = Published(BookingAvailability.Open, "javascript:alert(1)")
            .EvaluateLifecycle(Start.AddMinutes(-1));

        Assert.Equal(BookingAvailability.Hidden, state.BookingAvailability);
        Assert.False(state.IsBookingActionable);
        Assert.Null(state.SafeBookingUrl);
    }

    [Fact]
    public void EndedEventWithStoredOpenBookingIsEffectivelyClosed()
    {
        var state = Published(BookingAvailability.Open, "https://tickets.example.com")
            .EvaluateLifecycle(End);

        Assert.Equal(EventDisplayStatus.Finished, state.DisplayStatus);
        Assert.Equal(BookingAvailability.Closed, state.BookingAvailability);
        Assert.False(state.IsBookingActionable);
    }

    [Fact]
    public void NonPublishedLifecycleNeverExposesActionableBooking()
    {
        var draft = Create(BookingAvailability.Open, "https://tickets.example.com");
        var archived = Published(BookingAvailability.Open, "https://tickets.example.com");
        archived.Archive(Start.AddDays(-1));
        var cancelled = Published(BookingAvailability.Open, "https://tickets.example.com");
        cancelled.Cancel(Start.AddDays(-1));

        Assert.Equal(BookingAvailability.Hidden, draft.GetBookingAvailability(Start.AddMinutes(-1)));
        Assert.Equal(BookingAvailability.Hidden, archived.GetBookingAvailability(Start.AddMinutes(-1)));
        Assert.Equal(BookingAvailability.Closed, cancelled.GetBookingAvailability(Start.AddMinutes(-1)));
        Assert.False(draft.EvaluateLifecycle(Start).IsBookingActionable);
        Assert.False(archived.EvaluateLifecycle(Start).IsBookingActionable);
        Assert.False(cancelled.EvaluateLifecycle(Start).IsBookingActionable);
    }

    [Fact]
    public void NotOpenYetCannotBePersistedAsManualState()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            Create(BookingAvailability.NotOpenYet, "https://tickets.example.com"));
    }

    private static EntertainmentEvent Published(
        BookingAvailability bookingStatus,
        string? bookingUrl = null,
        DateTimeOffset? bookingOpensAtUtc = null,
        DateTimeOffset? bookingClosesAtUtc = null)
    {
        var item = Create(bookingStatus, bookingUrl, bookingOpensAtUtc, bookingClosesAtUtc);
        item.Publish(Start.AddDays(-2));
        return item;
    }

    private static EntertainmentEvent Create(
        BookingAvailability bookingStatus,
        string? bookingUrl,
        DateTimeOffset? bookingOpensAtUtc = null,
        DateTimeOffset? bookingClosesAtUtc = null) =>
        new(Guid.NewGuid(), "sample-event", "Sample", "Short", "Long", "Concert", Start, End,
            "Asia/Amman", "Amman", "Venue", null, null, bookingUrl,
            bookingStatus == BookingAvailability.Open, bookingOpensAtUtc, bookingClosesAtUtc,
            false, false, Start.AddDays(-3), bookingStatus);
}
