using TheDomain.Application.Events;
using TheDomain.Domain.Events;

namespace TheDomain.Application.Tests.Events;

public sealed class PublicEventQueryRegressionTests
{
    [Fact]
    public async Task PublishedFutureEventAppearsInUpcomingEndpoint()
    {
        var now = DateTimeOffset.UtcNow;
        var upcoming = Create("upcoming", now.AddDays(1), now.AddDays(2));
        upcoming.Publish(now);

        var service = new EventService(new FakeRepository(upcoming), TimeProvider.System);
        var result = await service.GetUpcomingAsync(CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("upcoming", result[0].Slug);
        Assert.Equal(EventDisplayStatus.Upcoming, result[0].DisplayStatus);
    }

    [Fact]
    public async Task PublishedFeaturedEventAppearsInFeaturedEndpoint()
    {
        var now = DateTimeOffset.UtcNow;
        var featured = Create("featured", now.AddDays(1), now.AddDays(2));
        featured.Publish(now);
        featured.Update(featured.Slug, featured.Title, featured.ShortDescription, featured.LongDescription, featured.EventType,
            featured.StartAtUtc, featured.EndAtUtc, featured.TimeZoneId, featured.City, featured.VenueName,
            featured.VenueAddress, featured.MapUrl, featured.ExternalBookingUrl, featured.IsBookingEnabled,
            featured.BookingOpensAtUtc, featured.BookingClosesAtUtc, true, featured.ShowOnHomepage, now);

        var service = new EventService(new FakeRepository(featured), TimeProvider.System);
        var result = await service.GetFeaturedAsync(CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("featured", result[0].Slug);
    }

    [Fact]
    public async Task ArchivedEventsDoNotAppearInPublicEndpoints()
    {
        var now = DateTimeOffset.UtcNow;
        var archived = Create("archived", now.AddDays(1), now.AddDays(2));
        archived.Publish(now);
        archived.Archive(now.AddMinutes(1));

        var service = new EventService(new FakeRepository(archived), TimeProvider.System);
        var upcoming = await service.GetUpcomingAsync(CancellationToken.None);
        var featured = await service.GetFeaturedAsync(CancellationToken.None);

        Assert.Empty(upcoming);
        Assert.Empty(featured);
    }

    [Fact]
    public async Task DraftEventsDoNotAppearInPublicEndpoints()
    {
        var now = DateTimeOffset.UtcNow;
        var draft = Create("draft", now.AddDays(1), now.AddDays(2));

        var service = new EventService(new FakeRepository(draft), TimeProvider.System);
        var upcoming = await service.GetUpcomingAsync(CancellationToken.None);
        var featured = await service.GetFeaturedAsync(CancellationToken.None);

        Assert.Empty(upcoming);
        Assert.Empty(featured);
    }

    private static EntertainmentEvent Create(string slug, DateTimeOffset start, DateTimeOffset end) =>
        new(Guid.NewGuid(), slug, "Title", "Short", "Long", "Concert", start, end, "Asia/Amman", "Amman", "Venue", null, null, null, false, null, null, false, false, start.AddDays(-10));

    private sealed class FakeRepository(params EntertainmentEvent[] events) : IEventRepository
    {
        private readonly List<EntertainmentEvent> _events = [.. events];
        public Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<EntertainmentEvent>>(_events);
        public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(_events.SingleOrDefault(item => item.Id == id));
        public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) => Task.FromResult(_events.SingleOrDefault(item => item.Slug == slug));
        public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => Task.FromResult(_events.Any(item => item.Slug == slug && item.Id != excludingId));
        public void Add(EntertainmentEvent eventEntity) => _events.Add(eventEntity);
        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
