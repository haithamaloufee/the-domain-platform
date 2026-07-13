using TheDomain.Application.Events.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Events;

public sealed class EventService(IEventRepository repository, TimeProvider timeProvider) : IEventService
{
    private const int MaximumPublicItems = 50;
    public async Task<IReadOnlyList<PublicEventResponse>> GetUpcomingAsync(CancellationToken cancellationToken) =>
        await GetPublicListAsync(status => status is EventDisplayStatus.Upcoming or EventDisplayStatus.Live, false, cancellationToken);
    public async Task<IReadOnlyList<PublicEventResponse>> GetPreviousAsync(CancellationToken cancellationToken) =>
        await GetPublicListAsync(status => status == EventDisplayStatus.Finished, false, cancellationToken);
    public async Task<IReadOnlyList<PublicEventResponse>> GetFeaturedAsync(CancellationToken cancellationToken) =>
        await GetPublicListAsync(_ => true, true, cancellationToken);

    public async Task<PublicEventResponse?> GetPublicBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var item = await repository.FindBySlugAsync(slug, cancellationToken);
        return item is not null && IsPublic(item) ? MapPublic(item, timeProvider.GetUtcNow()) : null;
    }

    public async Task<IReadOnlyList<GalleryAlbumResponse>> GetGalleryAlbumsAsync(CancellationToken cancellationToken)
    {
        var events = await repository.ListAsync(cancellationToken);
        return events.Where(IsPublic).Select(MapAlbum).Where(album => album.Media.Count > 0).Take(MaximumPublicItems).ToArray();
    }
    public async Task<GalleryAlbumResponse?> GetGalleryAlbumAsync(string slug, CancellationToken cancellationToken)
    {
        var item = await repository.FindBySlugAsync(slug, cancellationToken);
        return item is not null && IsPublic(item) ? MapAlbum(item) : null;
    }
    public async Task<IReadOnlyList<AdminEventResponse>> GetAdminEventsAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        return (await repository.ListAsync(cancellationToken)).Select(item => MapAdmin(item, now)).ToArray();
    }
    public async Task<AdminEventResponse?> GetAdminByIdAsync(Guid id, CancellationToken cancellationToken) =>
        await repository.FindByIdAsync(id, cancellationToken) is { } item ? MapAdmin(item, timeProvider.GetUtcNow()) : null;

    public async Task<EventOperationResult<AdminEventResponse>> CreateAsync(SaveEventRequest request, CancellationToken cancellationToken)
    {
        var errors = Validate(request);
        if (errors.Count > 0) return new(null, errors);
        if (await repository.SlugExistsAsync(request.Slug, null, cancellationToken)) return EventOperationResult.Failure<AdminEventResponse>("Slug is already in use.");
        var now = timeProvider.GetUtcNow();
        var item = CreateEvent(Guid.NewGuid(), request, now);
        repository.Add(item); await repository.SaveChangesAsync(cancellationToken);
        return EventOperationResult.Success(MapAdmin(item, now));
    }
    public async Task<EventOperationResult<AdminEventResponse>> UpdateAsync(Guid id, SaveEventRequest request, CancellationToken cancellationToken)
    {
        var errors = Validate(request); if (errors.Count > 0) return new(null, errors);
        var item = await repository.FindByIdAsync(id, cancellationToken); if (item is null) return EventOperationResult.Failure<AdminEventResponse>("Event was not found.");
        if (await repository.SlugExistsAsync(request.Slug, id, cancellationToken)) return EventOperationResult.Failure<AdminEventResponse>("Slug is already in use.");
        var now = timeProvider.GetUtcNow();
        Apply(item, request, now); await repository.SaveChangesAsync(cancellationToken);
        return EventOperationResult.Success(MapAdmin(item, now));
    }
    public Task<EventOperationResult<AdminEventResponse>> PublishAsync(Guid id, CancellationToken cancellationToken) => ChangeStatus(id, (item, now) => item.Publish(now), cancellationToken);
    public Task<EventOperationResult<AdminEventResponse>> ArchiveAsync(Guid id, CancellationToken cancellationToken) => ChangeStatus(id, (item, now) => item.Archive(now), cancellationToken);
    public Task<EventOperationResult<AdminEventResponse>> CancelAsync(Guid id, CancellationToken cancellationToken) => ChangeStatus(id, (item, now) => item.Cancel(now), cancellationToken);

    private async Task<IReadOnlyList<PublicEventResponse>> GetPublicListAsync(Func<EventDisplayStatus, bool> statusFilter, bool featuredOnly, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow(); var events = await repository.ListAsync(cancellationToken);
        return events.Where(IsPublic).Where(item => !featuredOnly || item.IsFeatured).Where(item => statusFilter(item.GetDisplayStatus(now)))
            .OrderBy(item => item.StartAtUtc).Take(MaximumPublicItems).Select(item => MapPublic(item, now)).ToArray();
    }
    private async Task<EventOperationResult<AdminEventResponse>> ChangeStatus(Guid id, Action<EntertainmentEvent, DateTimeOffset> change, CancellationToken cancellationToken)
    {
        var item = await repository.FindByIdAsync(id, cancellationToken); if (item is null) return EventOperationResult.Failure<AdminEventResponse>("Event was not found.");
        var now = timeProvider.GetUtcNow();
        change(item, now); await repository.SaveChangesAsync(cancellationToken); return EventOperationResult.Success(MapAdmin(item, now));
    }
    private static bool IsPublic(EntertainmentEvent item) => item.PublicationStatus == EventPublicationStatus.Published;
    private static List<string> Validate(SaveEventRequest request)
    {
        List<string> errors = [];
        if (string.IsNullOrWhiteSpace(request.Slug) || !request.Slug.All(character => char.IsAsciiLetterOrDigit(character) || character == '-') || request.Slug.StartsWith('-') || request.Slug.EndsWith('-')) errors.Add("Slug must be URL-safe lowercase letters, numbers, and hyphens.");
        if (!string.Equals(request.Slug, request.Slug.ToLowerInvariant(), StringComparison.Ordinal)) errors.Add("Slug must be lowercase.");
        if (string.IsNullOrWhiteSpace(request.Title)) errors.Add("Title is required.");
        if (string.IsNullOrWhiteSpace(request.EventType)) errors.Add("Event type is required.");
        if (string.IsNullOrWhiteSpace(request.City)) errors.Add("City is required.");
        if (string.IsNullOrWhiteSpace(request.VenueName)) errors.Add("Venue name is required.");
        if (request.EndAtUtc <= request.StartAtUtc) errors.Add("Event end must be after event start.");
        if (string.IsNullOrWhiteSpace(request.TimeZoneId)) errors.Add("Time zone is required.");
        ValidateUrl(request.ExternalBookingUrl, "External booking URL", errors); ValidateUrl(request.MapUrl, "Map URL", errors);
        if (request.BookingOpensAtUtc is not null && request.BookingClosesAtUtc < request.BookingOpensAtUtc) errors.Add("Booking close must not precede booking open.");
        return errors;
    }
    private static void ValidateUrl(string? value, string name, List<string> errors) { if (!string.IsNullOrWhiteSpace(value) && (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))) errors.Add($"{name} must be an absolute HTTP or HTTPS URL."); }
    private static EntertainmentEvent CreateEvent(Guid id, SaveEventRequest r, DateTimeOffset now) => new(id, r.Slug, r.Title, r.ShortDescription, r.LongDescription, r.EventType, r.StartAtUtc, r.EndAtUtc, r.TimeZoneId, r.City, r.VenueName, r.VenueAddress, r.MapUrl, r.ExternalBookingUrl, r.IsBookingEnabled, r.BookingOpensAtUtc, r.BookingClosesAtUtc, r.IsFeatured, r.ShowOnHomepage, now);
    private static void Apply(EntertainmentEvent item, SaveEventRequest r, DateTimeOffset now) => item.Update(r.Slug, r.Title, r.ShortDescription, r.LongDescription, r.EventType, r.StartAtUtc, r.EndAtUtc, r.TimeZoneId, r.City, r.VenueName, r.VenueAddress, r.MapUrl, r.ExternalBookingUrl, r.IsBookingEnabled, r.BookingOpensAtUtc, r.BookingClosesAtUtc, r.IsFeatured, r.ShowOnHomepage, now);
    private static PublicEventResponse MapPublic(EntertainmentEvent item, DateTimeOffset now) { var booking = item.GetBookingAvailability(now); return new(item.Id, item.Slug, item.Title, item.ShortDescription, item.EventType, item.StartAtUtc, item.EndAtUtc, item.TimeZoneId, item.City, item.VenueName, item.GetDisplayStatus(now), booking, booking == BookingAvailability.Open ? item.ExternalBookingUrl : null, MapMedia(item)); }
    private static PublicMediaResponse[] MapMedia(EntertainmentEvent item) => item.Media.Where(link => link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved).OrderBy(link => link.SortOrder).Select(link => new PublicMediaResponse(link.MediaAsset.Id, link.MediaAsset.MediaType, link.MediaAsset.Url, link.MediaAsset.ThumbnailUrl, link.MediaAsset.AltText, link.Usage, link.SortOrder, link.IsFeatured)).ToArray();
    private static GalleryAlbumResponse MapAlbum(EntertainmentEvent item) => new(item.Id, item.Slug, item.Title, item.StartAtUtc, MapMedia(item).Where(media => media.Usage == EventMediaUsage.Gallery).ToArray());
    private static AdminEventResponse MapAdmin(EntertainmentEvent item, DateTimeOffset now) => new(item.Id, item.Slug, item.Title, item.ShortDescription, item.LongDescription, item.EventType, item.StartAtUtc, item.EndAtUtc, item.TimeZoneId, item.City, item.VenueName, item.VenueAddress, item.MapUrl, item.ExternalBookingUrl, item.IsBookingEnabled, item.BookingOpensAtUtc, item.BookingClosesAtUtc, item.PublicationStatus, item.GetDisplayStatus(now), item.GetBookingAvailability(now), item.IsFeatured, item.ShowOnHomepage, item.CreatedAtUtc, item.UpdatedAtUtc);
}
