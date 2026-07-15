using TheDomain.Application.Events.Contracts;
using TheDomain.Application.Media;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Events;

public sealed class EventService(
    IEventRepository repository,
    TimeProvider timeProvider,
    IMediaDeliveryUrlResolver? mediaDeliveryUrlResolver = null) : IEventService
{
    private const int MaximumPublicItems = 50;
    public async Task<IReadOnlyList<PublicEventListResponse>> GetUpcomingAsync(CancellationToken cancellationToken) =>
        await GetPublicListAsync(state => state.DisplayStatus is EventDisplayStatus.Upcoming or EventDisplayStatus.Live, false, cancellationToken);
    public async Task<IReadOnlyList<PublicEventListResponse>> GetPreviousAsync(CancellationToken cancellationToken) =>
        await GetPublicListAsync(state => state.DisplayStatus == EventDisplayStatus.Finished, false, cancellationToken);
    public async Task<IReadOnlyList<PublicEventListResponse>> GetFeaturedAsync(CancellationToken cancellationToken) =>
        await GetPublicListAsync(state => state.DisplayStatus is EventDisplayStatus.Upcoming or EventDisplayStatus.Live, true, cancellationToken);

    public async Task<PublicEventDetailsResponse?> GetPublicBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var item = await repository.FindBySlugAsync(slug, cancellationToken);
        return item is not null && item.EvaluateLifecycle(now).IsPublicDetailVisible
            ? MapPublicDetails(item, now)
            : null;
    }

    public async Task<IReadOnlyList<GalleryAlbumListResponse>> GetGalleryAlbumsAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var events = await repository.ListAsync(cancellationToken);
        return events.Where(item => item.EvaluateLifecycle(now).IsPublicDetailVisible)
            .Select(MapAlbumList).OfType<GalleryAlbumListResponse>().Take(MaximumPublicItems).ToArray();
    }
    public async Task<GalleryAlbumDetailsResponse?> GetGalleryAlbumAsync(string slug, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var item = await repository.FindBySlugAsync(slug, cancellationToken);
        return item is not null && item.EvaluateLifecycle(now).IsPublicDetailVisible ? MapAlbumDetails(item) : null;
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
        var errors = Validate(request, request.Slug, allowMissingSlug: true, out var bookingStatus);
        if (errors.Count > 0) return new(null, errors);
        var now = timeProvider.GetUtcNow();
        var id = Guid.NewGuid();
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? await GenerateUniqueSlugAsync(request.Title, id, cancellationToken)
            : request.Slug.Trim();
        if (await repository.SlugExistsAsync(slug, null, cancellationToken)) return EventOperationResult.Conflict<AdminEventResponse>("Slug is already in use.");
        var item = CreateEvent(id, slug, request, bookingStatus, now);
        repository.Add(item); await repository.SaveChangesAsync(cancellationToken);
        return EventOperationResult.Success(MapAdmin(item, now));
    }
    public async Task<EventOperationResult<AdminEventResponse>> UpdateAsync(Guid id, SaveEventRequest request, CancellationToken cancellationToken)
    {
        var item = await repository.FindByIdAsync(id, cancellationToken); if (item is null) return EventOperationResult.NotFound<AdminEventResponse>("Event was not found.");
        // Existing slugs are deliberately stable. A title change never changes the public URL;
        // only a non-empty explicit slug override can do so, regardless of publication state.
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? item.Slug : request.Slug.Trim();
        var errors = Validate(request, slug, allowMissingSlug: false, out var bookingStatus); if (errors.Count > 0) return new(null, errors);
        if (await repository.SlugExistsAsync(slug, id, cancellationToken)) return EventOperationResult.Conflict<AdminEventResponse>("Slug is already in use.");
        var now = timeProvider.GetUtcNow();
        Apply(item, slug, request, bookingStatus, now); await repository.SaveChangesAsync(cancellationToken);
        return EventOperationResult.Success(MapAdmin(item, now));
    }
    public Task<EventOperationResult<AdminEventResponse>> PublishAsync(Guid id, CancellationToken cancellationToken) =>
        ChangeStatus(id, EventPublicationStatus.Published, cancellationToken);
    public Task<EventOperationResult<AdminEventResponse>> ArchiveAsync(Guid id, CancellationToken cancellationToken) =>
        ChangeStatus(id, EventPublicationStatus.Archived, cancellationToken);
    public Task<EventOperationResult<AdminEventResponse>> CancelAsync(Guid id, CancellationToken cancellationToken) =>
        ChangeStatus(id, EventPublicationStatus.Cancelled, cancellationToken);

    private async Task<IReadOnlyList<PublicEventListResponse>> GetPublicListAsync(Func<EventLifecycleState, bool> stateFilter, bool featuredOnly, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow(); var events = await repository.ListAsync(cancellationToken);
        return events.Where(item => item.EvaluateLifecycle(now).IsPublicCollectionVisible)
            .Where(item => !featuredOnly || item.IsFeatured)
            .Where(item => stateFilter(item.EvaluateLifecycle(now)))
            .OrderBy(item => item.StartAtUtc).Take(MaximumPublicItems).Select(item => MapPublicList(item, now)).ToArray();
    }
    private async Task<EventOperationResult<AdminEventResponse>> ChangeStatus(Guid id, EventPublicationStatus target, CancellationToken cancellationToken)
    {
        var item = await repository.FindByIdAsync(id, cancellationToken); if (item is null) return EventOperationResult.NotFound<AdminEventResponse>("Event was not found.");
        var now = timeProvider.GetUtcNow();
        if (item.PublicationStatus == target) return EventOperationResult.Success(MapAdmin(item, now));
        if (!CanTransition(item.PublicationStatus, target))
            return EventOperationResult.Failure<AdminEventResponse>($"An event cannot transition from {item.PublicationStatus} to {target}.");
        if (target == EventPublicationStatus.Published)
        {
            var publishErrors = ValidateForPublish(item);
            if (publishErrors.Count > 0) return new(null, publishErrors);
            item.Publish(now);
        }
        else if (target == EventPublicationStatus.Archived) item.Archive(now);
        else item.Cancel(now);
        await repository.SaveChangesAsync(cancellationToken); return EventOperationResult.Success(MapAdmin(item, now));
    }
    private static List<string> Validate(SaveEventRequest request, string? slug, bool allowMissingSlug, out BookingAvailability bookingStatus)
    {
        List<string> errors = [];
        if ((!allowMissingSlug || !string.IsNullOrWhiteSpace(slug)) && !EventSlugGenerator.IsValid(slug))
            errors.Add($"Slug must be at most {EventSlugGenerator.MaximumLength} URL-safe lowercase letters, numbers, and single hyphens.");
        if (string.IsNullOrWhiteSpace(request.Title)) errors.Add("Title is required.");
        if (string.IsNullOrWhiteSpace(request.ShortDescription)) errors.Add("Short description is required.");
        if (string.IsNullOrWhiteSpace(request.LongDescription)) errors.Add("Full description is required.");
        if (string.IsNullOrWhiteSpace(request.EventType)) errors.Add("Event type is required.");
        if (string.IsNullOrWhiteSpace(request.City)) errors.Add("City is required.");
        if (string.IsNullOrWhiteSpace(request.VenueName)) errors.Add("Venue name is required.");
        if (request.StartAtUtc == default) errors.Add("Event start is required.");
        if (request.EndAtUtc == default) errors.Add("Event end is required.");
        if (request.EndAtUtc <= request.StartAtUtc) errors.Add("Event end must be after event start.");
        ValidateTimeZone(request.TimeZoneId, errors);
        ValidateBookingUrl(request.ExternalBookingUrl, errors); ValidateUrl(request.MapUrl, "Map URL", errors);
        if (request.BookingOpensAtUtc is not null && request.BookingClosesAtUtc < request.BookingOpensAtUtc) errors.Add("Booking close must not precede booking open.");
        bookingStatus = ResolveBookingStatus(request, errors);
        if (bookingStatus == BookingAvailability.Open && string.IsNullOrWhiteSpace(request.ExternalBookingUrl))
            errors.Add("Open booking requires a valid HTTPS booking URL.");
        return errors;
    }
    private static void ValidateUrl(string? value, string name, List<string> errors) { if (!string.IsNullOrWhiteSpace(value) && (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))) errors.Add($"{name} must be an absolute HTTP or HTTPS URL."); }
    private static void ValidateBookingUrl(string? value, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
            errors.Add("External booking URL must be an absolute HTTPS URL.");
    }
    private static void ValidateTimeZone(string? value, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value)) { errors.Add("Time zone is required."); return; }
        try { _ = TimeZoneInfo.FindSystemTimeZoneById(value.Trim()); }
        catch (TimeZoneNotFoundException) { errors.Add("Time zone must be a valid supported identifier."); }
        catch (InvalidTimeZoneException) { errors.Add("Time zone must be a valid supported identifier."); }
    }
    private static BookingAvailability ResolveBookingStatus(SaveEventRequest request, List<string> errors)
    {
        if (request.BookingStatus is not { } explicitStatus)
            return request.IsBookingEnabled == true ? BookingAvailability.Open : BookingAvailability.Hidden;
        if (!EntertainmentEvent.IsManualBookingStatus(explicitStatus))
        {
            errors.Add("Booking status must be Hidden, Open, Closed, or SoldOut. NotOpenYet is derived automatically.");
            return BookingAvailability.Hidden;
        }
        if (request.IsBookingEnabled is { } legacyEnabled && legacyEnabled != (explicitStatus == BookingAvailability.Open))
            errors.Add("Booking status conflicts with the legacy booking-enabled value.");
        return explicitStatus;
    }
    private static bool CanTransition(EventPublicationStatus current, EventPublicationStatus target) =>
        (current, target) switch
        {
            (EventPublicationStatus.Draft, EventPublicationStatus.Published or EventPublicationStatus.Cancelled or EventPublicationStatus.Archived) => true,
            (EventPublicationStatus.Published, EventPublicationStatus.Cancelled or EventPublicationStatus.Archived) => true,
            (EventPublicationStatus.Cancelled, EventPublicationStatus.Archived) => true,
            _ => false
        };
    private static List<string> ValidateForPublish(EntertainmentEvent item)
    {
        List<string> errors = [];
        if (item.EndAtUtc <= item.StartAtUtc) errors.Add("Event end must be after event start.");
        ValidateTimeZone(item.TimeZoneId, errors);
        if (item.BookingStatus == BookingAvailability.Open)
        {
            ValidateBookingUrl(item.ExternalBookingUrl, errors);
            if (string.IsNullOrWhiteSpace(item.ExternalBookingUrl))
                errors.Add("Open booking requires a valid HTTPS booking URL.");
        }
        return errors;
    }
    private async Task<string> GenerateUniqueSlugAsync(string title, Guid eventId, CancellationToken cancellationToken)
    {
        var baseSlug = EventSlugGenerator.FromTitle(title, eventId);
        for (var occurrence = 1; ; occurrence++)
        {
            var candidate = EventSlugGenerator.WithCollisionSuffix(baseSlug, occurrence);
            if (!await repository.SlugExistsAsync(candidate, null, cancellationToken)) return candidate;
        }
    }
    private static EntertainmentEvent CreateEvent(Guid id, string slug, SaveEventRequest r, BookingAvailability bookingStatus, DateTimeOffset now) => new(id, slug, r.Title.Trim(), r.ShortDescription.Trim(), r.LongDescription.Trim(), r.EventType.Trim(), r.StartAtUtc, r.EndAtUtc, r.TimeZoneId.Trim(), r.City.Trim(), r.VenueName.Trim(), Clean(r.VenueAddress), Clean(r.MapUrl), Clean(r.ExternalBookingUrl), r.IsBookingEnabled ?? false, r.BookingOpensAtUtc, r.BookingClosesAtUtc, r.IsFeatured, r.ShowOnHomepage, now, bookingStatus);
    private static void Apply(EntertainmentEvent item, string slug, SaveEventRequest r, BookingAvailability bookingStatus, DateTimeOffset now) => item.Update(slug, r.Title.Trim(), r.ShortDescription.Trim(), r.LongDescription.Trim(), r.EventType.Trim(), r.StartAtUtc, r.EndAtUtc, r.TimeZoneId.Trim(), r.City.Trim(), r.VenueName.Trim(), Clean(r.VenueAddress), Clean(r.MapUrl), Clean(r.ExternalBookingUrl), r.IsBookingEnabled ?? false, r.BookingOpensAtUtc, r.BookingClosesAtUtc, r.IsFeatured, r.ShowOnHomepage, now, bookingStatus);
    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private PublicEventListResponse MapPublicList(EntertainmentEvent item, DateTimeOffset now)
    {
        var state = item.EvaluateLifecycle(now);
        return new(item.Id, item.Slug, item.Title, item.ShortDescription, item.EventType, item.StartAtUtc,
            item.EndAtUtc, item.TimeZoneId, item.City, item.VenueName, state.DisplayStatus,
            state.BookingAvailability, state.SafeBookingUrl, SelectCoverMedia(item));
    }
    private PublicEventDetailsResponse MapPublicDetails(EntertainmentEvent item, DateTimeOffset now)
    {
        var state = item.EvaluateLifecycle(now);
        var media = MapMedia(item);
        return new(item.Id, item.Slug, item.Title, item.ShortDescription, item.LongDescription, item.EventType,
            item.StartAtUtc, item.EndAtUtc, item.TimeZoneId, item.City, item.VenueName, item.VenueAddress,
            item.MapUrl, state.DisplayStatus, state.BookingAvailability, state.SafeBookingUrl, media,
            SelectCoverMedia(item));
    }
    private PublicMediaResponse[] MapMedia(EntertainmentEvent item) => item.Media
        .Where(link => link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved && HasSafePublicUrl(link.MediaAsset))
        .OrderBy(link => link.SortOrder)
        .ThenBy(link => link.CreatedAtUtc)
        .ThenBy(link => link.Id)
        .Select(MapMedia)
        .ToArray();
    private PublicMediaResponse? SelectCoverMedia(EntertainmentEvent item)
        => item.Media
            .Where(link => link.Usage == EventMediaUsage.Cover &&
                link.MediaAsset.MediaType == MediaType.Image &&
                link.MediaAsset.ApprovalStatus == MediaApprovalStatus.Approved &&
                HasSafePublicUrl(link.MediaAsset))
            .OrderBy(link => link.SortOrder)
            .ThenBy(link => link.CreatedAtUtc)
            .ThenBy(link => link.Id)
            .Select(MapMedia)
            .FirstOrDefault();
    private GalleryAlbumListResponse? MapAlbumList(EntertainmentEvent item)
    {
        var media = GalleryMedia(item); if (media.Length == 0) return null;
        return new(item.Id, item.Slug, item.Title, item.StartAtUtc, item.TimeZoneId, item.City, item.VenueName,
            media.Length, media.Count(value => value.MediaType == MediaType.Image), media.Count(value => value.MediaType == MediaType.Video),
            media.FirstOrDefault(value => value.IsFeatured) ?? media[0]);
    }
    private GalleryAlbumDetailsResponse MapAlbumDetails(EntertainmentEvent item) => new(item.Id, item.Slug, item.Title, item.StartAtUtc, item.TimeZoneId, item.City, item.VenueName, GalleryMedia(item));
    private PublicMediaResponse[] GalleryMedia(EntertainmentEvent item) => MapMedia(item).Where(media => media.Usage == EventMediaUsage.Gallery).ToArray();
    private PublicMediaResponse MapMedia(EventMedia link) => new(link.MediaAsset.Id, link.MediaAsset.MediaType,
        link.MediaAsset.Url, ResolveThumbnailUrl(link.MediaAsset), link.MediaAsset.Caption, link.MediaAsset.AltText,
        link.MediaAsset.Width, link.MediaAsset.Height, link.MediaAsset.DurationSeconds, link.MediaAsset.Orientation,
        link.Usage, link.SortOrder, link.IsFeatured);
    private static bool HasSafePublicUrl(MediaAsset item) => Uri.TryCreate(item.Url, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps;
    private string? ResolveThumbnailUrl(MediaAsset item) => mediaDeliveryUrlResolver?.ResolveThumbnailUrl(item.MediaType, item.Url, item.ThumbnailUrl, item.CloudinaryPublicId) ?? item.ThumbnailUrl;
    private static AdminEventResponse MapAdmin(EntertainmentEvent item, DateTimeOffset now)
    {
        var state = item.EvaluateLifecycle(now);
        return new(item.Id, item.Slug, item.Title, item.ShortDescription, item.LongDescription,
            item.EventType, item.StartAtUtc, item.EndAtUtc, item.TimeZoneId, item.City, item.VenueName,
            item.VenueAddress, item.MapUrl, item.ExternalBookingUrl, state.IsBookingActionable,
            item.BookingStatus, item.BookingOpensAtUtc, item.BookingClosesAtUtc,
            item.PublicationStatus, state.DisplayStatus, state.BookingAvailability, item.IsFeatured,
            item.ShowOnHomepage, item.CreatedAtUtc, item.UpdatedAtUtc);
    }
}
