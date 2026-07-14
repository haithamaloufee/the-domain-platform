using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Events;

public sealed class EventServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 8, 1, 12, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public async Task CreateRejectsEndAtOrBeforeStart(int endOffsetMinutes)
    {
        var request = Request(start: Now.AddDays(1), end: Now.AddDays(1).AddMinutes(endOffsetMinutes));

        var result = await Service(new FakeRepository()).CreateAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains("after event start", StringComparison.Ordinal));
    }

    [Fact]
    public async Task CreateAcceptsValidDateRangeAndTimezone()
    {
        var result = await Service(new FakeRepository()).CreateAsync(Request(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Asia/Amman", result.Value!.TimeZoneId);
    }

    [Fact]
    public async Task CreateRejectsUnknownTimezone()
    {
        var result = await Service(new FakeRepository()).CreateAsync(
            Request(timeZoneId: "Mars/Olympus"), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains("valid supported identifier", StringComparison.Ordinal));
    }

    [Theory]
    [InlineData(true, BookingAvailability.Open)]
    [InlineData(false, BookingAvailability.Hidden)]
    public async Task LegacyBookingBooleanMapsToManualStatus(
        bool enabled, BookingAvailability expectedStatus)
    {
        var url = enabled ? "https://tickets.example.com" : null;

        var result = await Service(new FakeRepository()).CreateAsync(
            Request(isBookingEnabled: enabled, bookingStatus: null, bookingUrl: url),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(expectedStatus, result.Value!.BookingStatus);
    }

    [Theory]
    [InlineData(BookingAvailability.Hidden)]
    [InlineData(BookingAvailability.Open)]
    [InlineData(BookingAvailability.Closed)]
    [InlineData(BookingAvailability.SoldOut)]
    public async Task ExplicitManualBookingStatusIsAuthoritative(BookingAvailability bookingStatus)
    {
        var result = await Service(new FakeRepository()).CreateAsync(
            Request(isBookingEnabled: null, bookingStatus: bookingStatus,
                bookingUrl: bookingStatus == BookingAvailability.Open
                    ? "https://tickets.example.com"
                    : null),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(bookingStatus, result.Value!.BookingStatus);
    }

    [Fact]
    public async Task ContradictoryLegacyAndExplicitBookingValuesAreRejected()
    {
        var result = await Service(new FakeRepository()).CreateAsync(
            Request(isBookingEnabled: false, bookingStatus: BookingAvailability.Open,
                bookingUrl: "https://tickets.example.com"),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains("conflicts", StringComparison.Ordinal));
    }

    [Fact]
    public async Task NotOpenYetCannotBeSubmittedAsManualStatus()
    {
        var result = await Service(new FakeRepository()).CreateAsync(
            Request(isBookingEnabled: null, bookingStatus: BookingAvailability.NotOpenYet),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains("derived automatically", StringComparison.Ordinal));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("http://tickets.example.com")]
    [InlineData("javascript:alert(1)")]
    public async Task OpenBookingRequiresSafeHttpsUrl(string? url)
    {
        var result = await Service(new FakeRepository()).CreateAsync(
            Request(isBookingEnabled: null, bookingStatus: BookingAvailability.Open, bookingUrl: url),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains("HTTPS", StringComparison.Ordinal));
    }

    [Fact]
    public async Task UpdatePreservesAssignedMediaAndCover()
    {
        var item = Event("preserve-media");
        var cover = new MediaAsset(Guid.NewGuid(), "cover.jpg", "cover.jpg", MediaType.Image,
            "https://res.cloudinary.com/test/image/upload/cover.jpg", null, 1200, 1500, null,
            MediaOrientation.Portrait, null, null, "Cover", MediaApprovalStatus.Approved,
            "cover", Now);
        var assignment = new EventMedia(Guid.NewGuid(), item.Id, cover.Id, EventMediaUsage.Cover,
            0, true, Now);
        item.AddMedia(assignment, cover);
        var repository = new FakeRepository(item);

        var result = await Service(repository).UpdateAsync(item.Id,
            Request(slug: item.Slug, title: "Updated title"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(item.Media);
        Assert.Same(assignment, item.Media.Single());
        Assert.Equal(EventMediaUsage.Cover, item.Media.Single().Usage);
        Assert.Equal("https://res.cloudinary.com/test/image/upload/cover.jpg",
            item.Media.Single().MediaAsset.Url);
    }

    [Fact]
    public async Task MissingUpdateReturnsNotFoundWithoutSaving()
    {
        var repository = new FakeRepository();

        var result = await Service(repository).UpdateAsync(Guid.NewGuid(), Request(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(EventFailureKind.NotFound, result.FailureKind);
        Assert.Equal(0, repository.SaveCount);
    }

    private static EventService Service(FakeRepository repository) =>
        new(repository, new FixedTimeProvider(Now));

    private static SaveEventRequest Request(
        string slug = "sample-event",
        string title = "Title",
        DateTimeOffset? start = null,
        DateTimeOffset? end = null,
        string timeZoneId = "Asia/Amman",
        bool? isBookingEnabled = false,
        BookingAvailability? bookingStatus = null,
        string? bookingUrl = null) =>
        new(slug, title, "Short", "Long", "Concert", start ?? Now.AddDays(1),
            end ?? Now.AddDays(2), timeZoneId, "Amman", "Venue", null, null, bookingUrl,
            isBookingEnabled, null, null, false, false, bookingStatus);

    private static EntertainmentEvent Event(string slug) =>
        new(Guid.NewGuid(), slug, "Title", "Short", "Long", "Concert", Now.AddDays(1),
            Now.AddDays(2), "Asia/Amman", "Amman", "Venue", null, null, null, false,
            null, null, false, false, Now.AddDays(-1));

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class FakeRepository(params EntertainmentEvent[] events) : IEventRepository
    {
        private readonly List<EntertainmentEvent> _events = [.. events];
        public int SaveCount { get; private set; }
        public Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<EntertainmentEvent>>(_events);
        public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(_events.SingleOrDefault(item => item.Id == id));
        public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) =>
            Task.FromResult(_events.SingleOrDefault(item => item.Slug == slug));
        public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) =>
            Task.FromResult(_events.Any(item => item.Slug == slug && item.Id != excludingId));
        public void Add(EntertainmentEvent eventEntity) => _events.Add(eventEntity);
        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.CompletedTask;
        }
    }
}
