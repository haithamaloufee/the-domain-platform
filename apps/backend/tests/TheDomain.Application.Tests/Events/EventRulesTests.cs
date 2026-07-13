using TheDomain.Domain.Events;

namespace TheDomain.Application.Tests.Events;

public sealed class EventRulesTests
{
    private static readonly DateTimeOffset Start = new(2026, 8, 1, 18, 0, 0, TimeSpan.Zero);

    [Fact] public void DisplayStatusIsUpcomingBeforeStart() => Assert.Equal(EventDisplayStatus.Upcoming, Published().GetDisplayStatus(Start.AddMinutes(-1)));
    [Fact] public void DisplayStatusIsLiveDuringEvent() => Assert.Equal(EventDisplayStatus.Live, Published().GetDisplayStatus(Start.AddMinutes(30)));
    [Fact] public void DisplayStatusIsFinishedAfterEnd() => Assert.Equal(EventDisplayStatus.Finished, Published().GetDisplayStatus(Start.AddHours(3)));
    [Fact] public void DisplayStatusIsCancelledWhenCancelled() { var item = Published(); item.Cancel(Start); Assert.Equal(EventDisplayStatus.Cancelled, item.GetDisplayStatus(Start)); }
    [Fact] public void BookingIsHiddenWhenDisabled() => Assert.Equal(BookingAvailability.Hidden, Create(false, "https://tickets.example.com").GetBookingAvailability(Start.AddMinutes(-1)));
    [Fact] public void BookingIsOpenWhenEnabledAndActive() => Assert.Equal(BookingAvailability.Open, Create(true, "https://tickets.example.com").GetBookingAvailability(Start.AddMinutes(-1)));
    [Fact] public void BookingIsClosedWhenFinished() => Assert.Equal(BookingAvailability.Closed, Create(true, "https://tickets.example.com").GetBookingAvailability(Start.AddHours(3)));

    private static EntertainmentEvent Published() { var item = Create(true, "https://tickets.example.com"); item.Publish(Start.AddDays(-1)); return item; }
    private static EntertainmentEvent Create(bool bookingEnabled, string? bookingUrl) => new(Guid.NewGuid(), "sample-event", "Sample", "Short", "Long", "Concert", Start, Start.AddHours(2), "Asia/Amman", "Amman", "Venue", null, null, bookingUrl, bookingEnabled, null, null, false, false, Start.AddDays(-2));
}
