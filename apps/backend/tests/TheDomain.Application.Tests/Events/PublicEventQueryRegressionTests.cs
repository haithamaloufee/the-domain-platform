using TheDomain.Application.Events;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Events;

public sealed class PublicEventQueryRegressionTests
{
    private static readonly DateTimeOffset Now = new(2026, 8, 1, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task PublishedFutureAndActiveEventsAppearInUpcomingWithEffectiveStates()
    {
        var future = Published("future", Now.AddHours(1), Now.AddHours(3));
        var active = Published("active", Now.AddHours(-1), Now.AddHours(1));
        var cover = AttachCover(future);

        var result = await Service(future, active).GetUpcomingAsync(CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.Equal(EventDisplayStatus.Live, result.Single(item => item.Slug == "active").DisplayStatus);
        var futureResult = result.Single(item => item.Slug == "future");
        Assert.Equal(EventDisplayStatus.Upcoming, futureResult.DisplayStatus);
        Assert.Equal(cover.Id, futureResult.CoverMedia?.Id);
    }

    [Fact]
    public async Task PublishedEndedEventAppearsOnlyInPreviousAndKeepsCover()
    {
        var ended = Published("ended", Now.AddDays(-2), Now);
        var cover = AttachCover(ended);
        var service = Service(ended);

        var upcoming = await service.GetUpcomingAsync(CancellationToken.None);
        var previous = await service.GetPreviousAsync(CancellationToken.None);
        var featured = await service.GetFeaturedAsync(CancellationToken.None);

        Assert.Empty(upcoming);
        Assert.Empty(featured);
        Assert.Single(previous);
        Assert.Equal(EventDisplayStatus.Finished, previous[0].DisplayStatus);
        Assert.Equal(cover.Id, previous[0].CoverMedia?.Id);
    }

    [Fact]
    public async Task DraftAndArchivedEventsAreAbsentFromEveryPublicQueryAndDetails()
    {
        var draft = Event("draft", Now.AddHours(1), Now.AddHours(2), featured: true);
        var archived = Published("archived", Now.AddHours(1), Now.AddHours(2), featured: true);
        archived.Archive(Now.AddMinutes(-1));
        var service = Service(draft, archived);

        Assert.Empty(await service.GetUpcomingAsync(CancellationToken.None));
        Assert.Empty(await service.GetPreviousAsync(CancellationToken.None));
        Assert.Empty(await service.GetFeaturedAsync(CancellationToken.None));
        Assert.Null(await service.GetPublicBySlugAsync(draft.Slug, CancellationToken.None));
        Assert.Null(await service.GetPublicBySlugAsync(archived.Slug, CancellationToken.None));
    }

    [Fact]
    public async Task CancelledEventIsExcludedFromCollectionsButRemainsClearBySlug()
    {
        var cancelled = Published("cancelled", Now.AddHours(1), Now.AddHours(2), featured: true,
            bookingStatus: BookingAvailability.Open, bookingUrl: "https://tickets.example.com");
        cancelled.Cancel(Now.AddMinutes(-1));
        var service = Service(cancelled);

        Assert.Empty(await service.GetUpcomingAsync(CancellationToken.None));
        Assert.Empty(await service.GetPreviousAsync(CancellationToken.None));
        Assert.Empty(await service.GetFeaturedAsync(CancellationToken.None));
        var details = await service.GetPublicBySlugAsync(cancelled.Slug, CancellationToken.None);
        Assert.NotNull(details);
        Assert.Equal(EventDisplayStatus.Cancelled, details.DisplayStatus);
        Assert.Equal(BookingAvailability.Closed, details.BookingAvailability);
        Assert.Null(details.ExternalBookingUrl);
    }

    [Fact]
    public async Task FeaturedIncludesOnlyPublishedFutureOrActiveEvents()
    {
        var future = Published("future", Now.AddHours(1), Now.AddHours(2), featured: true);
        var active = Published("active", Now.AddHours(-1), Now.AddHours(1), featured: true);
        var ended = Published("ended", Now.AddHours(-2), Now, featured: true);
        var draft = Event("draft", Now.AddHours(1), Now.AddHours(2), featured: true);
        var cancelled = Published("cancelled", Now.AddHours(1), Now.AddHours(2), featured: true);
        cancelled.Cancel(Now.AddMinutes(-1));

        var result = await Service(future, active, ended, draft, cancelled)
            .GetFeaturedAsync(CancellationToken.None);

        Assert.Equal(["active", "future"], result.Select(item => item.Slug).Order().ToArray());
    }

    [Fact]
    public async Task PublicListAndDetailsShareEffectiveOpenBookingAndCover()
    {
        var item = Published("bookable", Now.AddHours(1), Now.AddHours(2),
            bookingStatus: BookingAvailability.Open, bookingUrl: "https://tickets.example.com");
        var cover = AttachCover(item);
        var service = Service(item);

        var list = await service.GetUpcomingAsync(CancellationToken.None);
        var details = await service.GetPublicBySlugAsync(item.Slug, CancellationToken.None);

        Assert.Single(list);
        Assert.NotNull(details);
        Assert.Equal(BookingAvailability.Open, list[0].BookingAvailability);
        Assert.Equal("https://tickets.example.com", list[0].ExternalBookingUrl);
        Assert.Equal(list[0].BookingAvailability, details.BookingAvailability);
        Assert.Equal(list[0].ExternalBookingUrl, details.ExternalBookingUrl);
        Assert.Equal(cover.Id, list[0].CoverMedia?.Id);
        Assert.Equal(cover.Id, details.CoverMedia?.Id);
    }

    private static EventService Service(params EntertainmentEvent[] events) =>
        new(new FakeRepository(events), new FixedTimeProvider(Now));

    private static EntertainmentEvent Published(
        string slug,
        DateTimeOffset start,
        DateTimeOffset end,
        bool featured = false,
        BookingAvailability bookingStatus = BookingAvailability.Hidden,
        string? bookingUrl = null)
    {
        var item = Event(slug, start, end, featured, bookingStatus, bookingUrl);
        item.Publish(Now.AddDays(-3));
        return item;
    }

    private static EntertainmentEvent Event(
        string slug,
        DateTimeOffset start,
        DateTimeOffset end,
        bool featured = false,
        BookingAvailability bookingStatus = BookingAvailability.Hidden,
        string? bookingUrl = null) =>
        new(Guid.NewGuid(), slug, "Title", "Short", "Long", "Concert", start, end,
            "Asia/Amman", "Amman", "Venue", null, null, bookingUrl,
            bookingStatus == BookingAvailability.Open, null, null, featured, false,
            Now.AddDays(-10), bookingStatus);

    private static MediaAsset AttachCover(EntertainmentEvent eventEntity)
    {
        var media = new MediaAsset(Guid.NewGuid(), "cover.jpg", "cover.jpg", MediaType.Image,
            "https://res.cloudinary.com/test-cloud/image/upload/cover.jpg", null, 1200, 1500,
            null, MediaOrientation.Portrait, null, null, "Event cover",
            MediaApprovalStatus.Approved, "cover", Now);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, media.Id,
            EventMediaUsage.Cover, 0, true, Now), media);
        return media;
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class FakeRepository(params EntertainmentEvent[] events) : IEventRepository
    {
        private readonly List<EntertainmentEvent> _events = [.. events];
        public Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<EntertainmentEvent>>(_events);
        public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(_events.SingleOrDefault(item => item.Id == id));
        public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) =>
            Task.FromResult(_events.SingleOrDefault(item => item.Slug == slug));
        public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) =>
            Task.FromResult(_events.Any(item => item.Slug == slug && item.Id != excludingId));
        public void Add(EntertainmentEvent eventEntity) => _events.Add(eventEntity);
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
