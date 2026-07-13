using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;
using TheDomain.Domain.Events;

namespace TheDomain.Application.Tests.Events;

public sealed class EventServiceTests
{
    [Fact]
    public async Task PublicUpcomingExcludesDraftEvents()
    {
        var now = DateTimeOffset.UtcNow;
        var draft = Create("draft", now.AddDays(1), now.AddDays(2));
        var published = Create("published", now.AddDays(1), now.AddDays(2)); published.Publish(now);
        var service = new EventService(new FakeRepository(draft, published), TimeProvider.System);
        var result = await service.GetUpcomingAsync(CancellationToken.None);
        Assert.Single(result); Assert.Equal("published", result[0].Slug);
    }

    [Fact]
    public async Task PublicPreviousReturnsFinishedPublishedEvents()
    {
        var now = DateTimeOffset.UtcNow;
        var finished = Create("finished", now.AddDays(-2), now.AddDays(-1)); finished.Publish(now.AddDays(-3));
        var service = new EventService(new FakeRepository(finished), TimeProvider.System);
        var result = await service.GetPreviousAsync(CancellationToken.None);
        Assert.Single(result); Assert.Equal(EventDisplayStatus.Finished, result[0].DisplayStatus);
    }

    [Fact]
    public async Task CreateRejectsEndBeforeStart()
    {
        var now = DateTimeOffset.UtcNow;
        var request = new SaveEventRequest("invalid", "Title", "Short", "Long", "Concert", now, now.AddHours(-1), "Asia/Amman", "Amman", "Venue", null, null, null, false, null, null, false, false);
        var result = await new EventService(new FakeRepository(), TimeProvider.System).CreateAsync(request, CancellationToken.None);
        Assert.False(result.IsSuccess); Assert.Contains(result.Errors, error => error.Contains("after event start", StringComparison.Ordinal));
    }

    private static EntertainmentEvent Create(string slug, DateTimeOffset start, DateTimeOffset end) => new(Guid.NewGuid(), slug, "Title", "Short", "Long", "Concert", start, end, "Asia/Amman", "Amman", "Venue", null, null, null, false, null, null, false, false, start.AddDays(-10));
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
