using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public sealed class MediaManagementService(
    IMediaRepository repository,
    IMediaStorageService storage,
    MediaUploadPolicy uploadPolicy,
    TimeProvider timeProvider,
    IMediaDeliveryUrlResolver? mediaDeliveryUrlResolver = null) : IMediaManagementService, IMediaQueryService
{
    public async Task<EventOperationResult<AdminMediaResponse>> UploadAsync(UploadMediaCommand command, CancellationToken token)
    {
        var errors = MediaUploadValidator.Validate(command.Length, command.OriginalFileName, command.ContentType, uploadPolicy);
        if (!Enum.IsDefined(command.ApprovalStatus)) errors = [.. errors, "Approval status is invalid."];
        if (command.EventId.HasValue != command.Usage.HasValue) errors = [.. errors, "Event and usage must be provided together."];
        var mediaType = MediaUploadValidator.GetMediaType(command.ContentType);
        if (command.Usage == EventMediaUsage.Cover && command.ApprovalStatus != MediaApprovalStatus.Approved)
            errors = [.. errors, "Only approved media can be uploaded as an event cover."];
        if (command.Usage == EventMediaUsage.Cover && mediaType != MediaType.Image)
            errors = [.. errors, "Only image media can be uploaded as an event cover."];
        if (errors.Count > 0) return new(null, errors);
        if (command.EventId is { } eventId && await repository.FindEventAsync(eventId, token) is null) return EventOperationResult.Failure<AdminMediaResponse>("Event was not found.");

        var safeName = MediaUploadValidator.SanitizeFileName(command.OriginalFileName);
        var publicId = Guid.NewGuid().ToString("N");
        var stored = await storage.UploadAsync(command.Content, safeName, publicId, mediaType, token);
        try
        {
            var now = timeProvider.GetUtcNow();
            var media = new MediaAsset(Guid.NewGuid(), safeName, safeName, mediaType, stored.Url, stored.ThumbnailUrl,
                stored.Width, stored.Height, stored.DurationSeconds, GetOrientation(stored.Width, stored.Height), command.Category,
                command.Caption, command.AltText, command.ApprovalStatus, stored.PublicId, now);
            repository.AddMedia(media);
            if (command.EventId is { } linkedEventId && command.Usage is { } usage)
            {
                var assignments = await repository.ListEventMediaForUpdateAsync(linkedEventId, token);
                var shouldBecomeCover = usage == EventMediaUsage.Cover ||
                    (FindActiveCover(assignments) is null && IsEligibleCover(media));
                if (usage == EventMediaUsage.Cover && !IsEligibleCover(media))
                {
                    await storage.DeleteAsync(stored.PublicId, mediaType, CancellationToken.None);
                    return EventOperationResult.Failure<AdminMediaResponse>(CoverEligibilityError(media));
                }
                var removedIds = shouldBecomeCover
                    ? DemoteCovers(assignments, exceptId: null)
                    : new HashSet<Guid>();
                var assignment = new EventMedia(Guid.NewGuid(), linkedEventId, media.Id,
                    shouldBecomeCover ? EventMediaUsage.Cover : usage, 0,
                    shouldBecomeCover || command.IsFeatured, now);
                repository.AddEventMedia(assignment);
                InsertAt(assignments.Where(item => !removedIds.Contains(item.Id)).ToArray(), assignment, command.SortOrder);
            }
            await repository.SaveChangesAsync(token);
            return EventOperationResult.Success(Map(media));
        }
        catch
        {
            try { await storage.DeleteAsync(stored.PublicId, mediaType, CancellationToken.None); } catch { }
            throw;
        }
    }

    public async Task<PagedResponse<AdminMediaListItemResponse>> GetAsync(MediaListQuery query, CancellationToken token)
    {
        var page = Math.Max(1, query.PageNumber); var size = Math.Clamp(query.PageSize, 1, 50);
        var normalized = query with { PageNumber = page, PageSize = size };
        var result = await repository.SearchAsync(normalized, token); var pages = (int)Math.Ceiling(result.TotalCount / (double)size);
        return new(page, size, result.TotalCount, pages, page < pages, page > 1, result.Items.Select(MapList).ToArray());
    }
    public async Task<AdminMediaResponse?> GetByIdAsync(Guid id, CancellationToken token) => await repository.FindMediaAsync(id, token) is { } item ? Map(item) : null;
    public async Task<IReadOnlyList<AdminEventMediaResponse>> GetEventMediaAsync(Guid eventId, CancellationToken token) =>
        (await repository.ListEventMediaAsync(eventId, token))
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.CreatedAtUtc)
            .ThenBy(item => item.Id)
            .Select(item => new AdminEventMediaResponse(item.Id, item.EventId, item.MediaAssetId, item.Usage,
                item.SortOrder, item.IsFeatured, item.CreatedAtUtc, Map(item.MediaAsset)))
            .ToArray();
    public Task<EventOperationResult<AdminMediaResponse>> UpdateMetadataAsync(Guid id, UpdateMediaMetadataRequest request, CancellationToken token) => ChangeMedia(id, item => item.UpdateMetadata(request.Category, request.Caption, request.AltText, timeProvider.GetUtcNow()), token);
    public Task<EventOperationResult<AdminMediaResponse>> ApproveAsync(Guid id, CancellationToken token) => ChangeMedia(id, item => item.Approve(timeProvider.GetUtcNow()), token);
    public async Task<EventOperationResult<AdminMediaResponse>> HideAsync(Guid id, CancellationToken token)
    {
        var media = await repository.FindMediaAsync(id, token);
        if (media is null) return EventOperationResult.Failure<AdminMediaResponse>("Media asset was not found.");

        media.Hide(timeProvider.GetUtcNow());
        var mediaAssignments = await repository.ListMediaAssignmentsForUpdateAsync(id, token);
        foreach (var eventId in mediaAssignments.Where(item => item.Usage == EventMediaUsage.Cover).Select(item => item.EventId).Distinct())
        {
            var eventAssignments = await repository.ListEventMediaForUpdateAsync(eventId, token);
            var removedIds = DemoteCovers(eventAssignments, exceptId: null);
            NormalizeOrder(eventAssignments.Where(item => !removedIds.Contains(item.Id)));
        }

        await repository.SaveChangesAsync(token);
        return EventOperationResult.Success(Map(media));
    }

    public async Task<EventOperationResult<EventMediaResponse>> AssignAsync(Guid eventId, AssignEventMediaRequest request, CancellationToken token)
    {
        if (!Enum.IsDefined(request.Usage)) return EventOperationResult.Failure<EventMediaResponse>("Event media usage is invalid.");
        if (request.SortOrder < 0) return EventOperationResult.Failure<EventMediaResponse>("Sort order must not be negative.");
        if (await repository.FindEventAsync(eventId, token) is null) return EventOperationResult.Failure<EventMediaResponse>("Event was not found.");
        var media = await repository.FindMediaAsync(request.MediaAssetId, token);
        if (media is null) return EventOperationResult.Failure<EventMediaResponse>("Media asset was not found.");

        var assignments = await repository.ListEventMediaForUpdateAsync(eventId, token);
        var duplicate = assignments.FirstOrDefault(item => item.MediaAssetId == request.MediaAssetId && item.Usage == request.Usage);
        if (duplicate is not null) return EventOperationResult.Success(Map(duplicate));
        var existingAssignment = Ordered(assignments)
            .FirstOrDefault(item => item.MediaAssetId == request.MediaAssetId);
        if (existingAssignment is not null) return EventOperationResult.Success(Map(existingAssignment));

        var shouldBecomeCover = request.Usage == EventMediaUsage.Cover ||
            (FindActiveCover(assignments) is null && IsEligibleCover(media));
        if (request.Usage == EventMediaUsage.Cover && !IsEligibleCover(media))
        {
            return EventOperationResult.Failure<EventMediaResponse>(CoverEligibilityError(media));
        }

        var removedIds = shouldBecomeCover
            ? DemoteCovers(assignments, exceptId: null)
            : new HashSet<Guid>();
        var item = new EventMedia(Guid.NewGuid(), eventId, request.MediaAssetId,
            shouldBecomeCover ? EventMediaUsage.Cover : request.Usage, 0,
            shouldBecomeCover || request.IsFeatured, timeProvider.GetUtcNow());
        repository.AddEventMedia(item);
        InsertAt(assignments.Where(candidate => !removedIds.Contains(candidate.Id)).ToArray(), item, request.SortOrder);
        await repository.SaveChangesAsync(token);
        return EventOperationResult.Success(Map(item));
    }

    public async Task<EventOperationResult<EventMediaResponse>> UpdateAssignmentAsync(Guid eventId, Guid eventMediaId, UpdateEventMediaRequest request, CancellationToken token)
    {
        if (!Enum.IsDefined(request.Usage)) return EventOperationResult.Failure<EventMediaResponse>("Event media usage is invalid.");
        if (request.SortOrder < 0) return EventOperationResult.Failure<EventMediaResponse>("Sort order must not be negative.");
        if (await repository.FindEventAsync(eventId, token) is null) return EventOperationResult.Failure<EventMediaResponse>("Event was not found.");
        var assignments = await repository.ListEventMediaForUpdateAsync(eventId, token);
        var item = assignments.SingleOrDefault(candidate => candidate.Id == eventMediaId);
        if (item is null) return EventOperationResult.Failure<EventMediaResponse>("Event media assignment was not found.");
        if (assignments.Any(candidate => candidate.Id != item.Id && candidate.MediaAssetId == item.MediaAssetId && candidate.Usage == request.Usage))
            return EventOperationResult.Failure<EventMediaResponse>("This event media assignment already exists.");
        if (request.Usage == EventMediaUsage.Cover && !IsEligibleCover(item.MediaAsset))
            return EventOperationResult.Failure<EventMediaResponse>(CoverEligibilityError(item.MediaAsset));

        if (request.Usage == EventMediaUsage.Cover) DemoteCovers(assignments, item.Id);
        item.Update(request.Usage, item.SortOrder,
            request.Usage == EventMediaUsage.Cover || request.IsFeatured);
        MoveTo(assignments, item, request.SortOrder);
        await repository.SaveChangesAsync(token);
        return EventOperationResult.Success(Map(item));
    }

    public async Task<EventOperationResult<EventMediaResponse>> SetCoverAsync(Guid eventId, Guid eventMediaId, CancellationToken token)
    {
        if (await repository.FindEventAsync(eventId, token) is null) return EventOperationResult.Failure<EventMediaResponse>("Event was not found.");
        var assignments = await repository.ListEventMediaForUpdateAsync(eventId, token);
        var target = assignments.SingleOrDefault(item => item.Id == eventMediaId);
        if (target is null) return EventOperationResult.Failure<EventMediaResponse>("Event media assignment was not found.");
        if (!IsEligibleCover(target.MediaAsset)) return EventOperationResult.Failure<EventMediaResponse>(CoverEligibilityError(target.MediaAsset));

        var existingForAsset = assignments.FirstOrDefault(item =>
            item.MediaAssetId == target.MediaAssetId && item.Usage == EventMediaUsage.Cover);
        var selected = existingForAsset ?? target;
        var otherCovers = assignments.Where(item => item.Usage == EventMediaUsage.Cover && item.Id != selected.Id).ToArray();
        if (selected.Usage == EventMediaUsage.Cover && otherCovers.Length == 0)
            return EventOperationResult.Success(Map(selected));

        DemoteCovers(assignments, selected.Id);
        selected.Update(EventMediaUsage.Cover, selected.SortOrder, true);
        await repository.SaveChangesAsync(token);
        return EventOperationResult.Success(Map(selected));
    }

    public async Task<EventOperationResult<IReadOnlyList<EventMediaResponse>>> ReorderAsync(
        Guid eventId, ReorderEventMediaRequest request, CancellationToken token)
    {
        if (await repository.FindEventAsync(eventId, token) is null)
            return EventOperationResult.Failure<IReadOnlyList<EventMediaResponse>>("Event was not found.");
        var assignments = await repository.ListEventMediaForUpdateAsync(eventId, token);
        var ids = request.EventMediaIds ?? [];
        if (ids.Count != assignments.Count || ids.Distinct().Count() != ids.Count ||
            !ids.ToHashSet().SetEquals(assignments.Select(item => item.Id)))
        {
            return EventOperationResult.Failure<IReadOnlyList<EventMediaResponse>>(
                "Reorder must include every assigned event media identifier exactly once.");
        }

        var byId = assignments.ToDictionary(item => item.Id);
        for (var index = 0; index < ids.Count; index++)
        {
            var item = byId[ids[index]];
            item.Update(item.Usage, index, item.IsFeatured);
        }
        await repository.SaveChangesAsync(token);
        return EventOperationResult.Success<IReadOnlyList<EventMediaResponse>>(
            ids.Select(id => Map(byId[id])).ToArray());
    }

    public async Task<bool> RemoveAssignmentAsync(Guid eventId, Guid eventMediaId, CancellationToken token)
    {
        if (await repository.FindEventAsync(eventId, token) is null) return false;
        var assignments = await repository.ListEventMediaForUpdateAsync(eventId, token);
        var item = assignments.SingleOrDefault(candidate => candidate.Id == eventMediaId);
        if (item is null) return false;
        repository.RemoveEventMedia(item);
        NormalizeOrder(assignments.Where(candidate => candidate.Id != item.Id));
        await repository.SaveChangesAsync(token);
        return true;
    }
    private async Task<EventOperationResult<AdminMediaResponse>> ChangeMedia(Guid id, Action<MediaAsset> change, CancellationToken token)
    { var item = await repository.FindMediaAsync(id, token); if (item is null) return EventOperationResult.Failure<AdminMediaResponse>("Media asset was not found."); change(item); await repository.SaveChangesAsync(token); return EventOperationResult.Success(Map(item)); }
    private static MediaOrientation GetOrientation(int? width, int? height) => width is null || height is null ? MediaOrientation.Unknown : width == height ? MediaOrientation.Square : width > height ? MediaOrientation.Landscape : MediaOrientation.Portrait;
    private AdminMediaResponse Map(MediaAsset item) => new(item.Id, item.FileName, item.OriginalFileName, item.MediaType, item.Url, ResolveThumbnailUrl(item), item.Width, item.Height, item.DurationSeconds, item.Orientation, item.Category, item.Caption, item.AltText, item.ApprovalStatus, item.CreatedAtUtc, item.UpdatedAtUtc);
    private AdminMediaListItemResponse MapList(MediaAsset item) => new(item.Id, item.FileName, item.OriginalFileName,
        item.MediaType, item.Url, ResolveThumbnailUrl(item), item.Orientation, item.Category, item.Caption,
        item.AltText, item.ApprovalStatus, item.CreatedAtUtc);
    private string? ResolveThumbnailUrl(MediaAsset item) => mediaDeliveryUrlResolver?.ResolveThumbnailUrl(item.MediaType, item.Url, item.ThumbnailUrl, item.CloudinaryPublicId) ?? item.ThumbnailUrl;
    private static EventMediaResponse Map(EventMedia item) => new(item.Id, item.EventId, item.MediaAssetId, item.Usage, item.SortOrder, item.IsFeatured, item.CreatedAtUtc);

    private static EventMedia? FindActiveCover(IEnumerable<EventMedia> assignments) => assignments
        .Where(item => item.Usage == EventMediaUsage.Cover && IsEligibleCover(item.MediaAsset))
        .OrderBy(item => item.SortOrder)
        .ThenBy(item => item.CreatedAtUtc)
        .ThenBy(item => item.Id)
        .FirstOrDefault();

    private static bool IsEligibleCover(MediaAsset media) =>
        media.MediaType == MediaType.Image &&
        media.ApprovalStatus == MediaApprovalStatus.Approved &&
        Uri.TryCreate(media.Url, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps;

    private static string CoverEligibilityError(MediaAsset media) => media.MediaType != MediaType.Image
        ? "Only image media can be selected as an event cover."
        : media.ApprovalStatus == MediaApprovalStatus.Draft
            ? "Draft media must be approved before it can be selected as an event cover."
            : media.ApprovalStatus == MediaApprovalStatus.Hidden
                ? "Hidden media cannot be selected as an event cover."
                : "The media URL is not eligible for use as a public event cover.";

    private HashSet<Guid> DemoteCovers(IReadOnlyList<EventMedia> assignments, Guid? exceptId)
    {
        HashSet<Guid> removedIds = [];
        foreach (var cover in assignments.Where(item => item.Usage == EventMediaUsage.Cover && item.Id != exceptId).ToArray())
        {
            var existingGallery = assignments.FirstOrDefault(item =>
                item.Id != cover.Id && item.MediaAssetId == cover.MediaAssetId && item.Usage == EventMediaUsage.Gallery);
            if (existingGallery is not null)
            {
                repository.RemoveEventMedia(cover);
                removedIds.Add(cover.Id);
            }
            else
            {
                cover.Update(EventMediaUsage.Gallery, cover.SortOrder, false);
            }
        }
        return removedIds;
    }

    private static void InsertAt(IReadOnlyList<EventMedia> assignments, EventMedia item, int requestedIndex)
    {
        var ordered = Ordered(assignments).ToList();
        ordered.Insert(Math.Clamp(requestedIndex, 0, ordered.Count), item);
        NormalizeOrder(ordered);
    }

    private static void MoveTo(IReadOnlyList<EventMedia> assignments, EventMedia item, int requestedIndex)
    {
        var ordered = Ordered(assignments).Where(candidate => candidate.Id != item.Id).ToList();
        ordered.Insert(Math.Clamp(requestedIndex, 0, ordered.Count), item);
        NormalizeOrder(ordered);
    }

    private static IEnumerable<EventMedia> Ordered(IEnumerable<EventMedia> assignments) => assignments
        .OrderBy(item => item.SortOrder)
        .ThenBy(item => item.CreatedAtUtc)
        .ThenBy(item => item.Id);

    private static void NormalizeOrder(IEnumerable<EventMedia> assignments)
    {
        var index = 0;
        foreach (var item in Ordered(assignments))
        {
            item.Update(item.Usage, index++, item.IsFeatured);
        }
    }

}
