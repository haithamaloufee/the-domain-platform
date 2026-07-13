using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public sealed class MediaManagementService(
    IMediaRepository repository,
    IMediaStorageService storage,
    MediaUploadPolicy uploadPolicy,
    TimeProvider timeProvider) : IMediaManagementService, IMediaQueryService
{
    public async Task<EventOperationResult<AdminMediaResponse>> UploadAsync(UploadMediaCommand command, CancellationToken token)
    {
        var errors = MediaUploadValidator.Validate(command.Length, command.OriginalFileName, command.ContentType, uploadPolicy);
        if (!Enum.IsDefined(command.ApprovalStatus)) errors = [.. errors, "Approval status is invalid."];
        if (command.EventId.HasValue != command.Usage.HasValue) errors = [.. errors, "Event and usage must be provided together."];
        if (errors.Count > 0) return new(null, errors);
        if (command.EventId is { } eventId && await repository.FindEventAsync(eventId, token) is null) return EventOperationResult.Failure<AdminMediaResponse>("Event was not found.");

        var safeName = MediaUploadValidator.SanitizeFileName(command.OriginalFileName);
        var mediaType = MediaUploadValidator.GetMediaType(command.ContentType);
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
                repository.AddEventMedia(new EventMedia(Guid.NewGuid(), linkedEventId, media.Id, usage, command.SortOrder, command.IsFeatured, now));
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
    public Task<EventOperationResult<AdminMediaResponse>> UpdateMetadataAsync(Guid id, UpdateMediaMetadataRequest request, CancellationToken token) => ChangeMedia(id, item => item.UpdateMetadata(request.Category, request.Caption, request.AltText, timeProvider.GetUtcNow()), token);
    public Task<EventOperationResult<AdminMediaResponse>> ApproveAsync(Guid id, CancellationToken token) => ChangeMedia(id, item => item.Approve(timeProvider.GetUtcNow()), token);
    public Task<EventOperationResult<AdminMediaResponse>> HideAsync(Guid id, CancellationToken token) => ChangeMedia(id, item => item.Hide(timeProvider.GetUtcNow()), token);

    public async Task<EventOperationResult<EventMediaResponse>> AssignAsync(Guid eventId, AssignEventMediaRequest request, CancellationToken token)
    {
        if (await repository.FindEventAsync(eventId, token) is null) return EventOperationResult.Failure<EventMediaResponse>("Event was not found.");
        if (await repository.FindMediaAsync(request.MediaAssetId, token) is null) return EventOperationResult.Failure<EventMediaResponse>("Media asset was not found.");
        if (await repository.AssignmentExistsAsync(eventId, request.MediaAssetId, request.Usage, null, token)) return EventOperationResult.Failure<EventMediaResponse>("This event media assignment already exists.");
        var item = new EventMedia(Guid.NewGuid(), eventId, request.MediaAssetId, request.Usage, request.SortOrder, request.IsFeatured, timeProvider.GetUtcNow());
        repository.AddEventMedia(item); await repository.SaveChangesAsync(token); return EventOperationResult.Success(Map(item));
    }
    public async Task<EventOperationResult<EventMediaResponse>> UpdateAssignmentAsync(Guid eventId, Guid eventMediaId, UpdateEventMediaRequest request, CancellationToken token)
    {
        var item = await repository.FindEventMediaAsync(eventId, eventMediaId, token); if (item is null) return EventOperationResult.Failure<EventMediaResponse>("Event media assignment was not found.");
        if (await repository.AssignmentExistsAsync(eventId, item.MediaAssetId, request.Usage, eventMediaId, token)) return EventOperationResult.Failure<EventMediaResponse>("This event media assignment already exists.");
        item.Update(request.Usage, request.SortOrder, request.IsFeatured); await repository.SaveChangesAsync(token); return EventOperationResult.Success(Map(item));
    }
    public async Task<bool> RemoveAssignmentAsync(Guid eventId, Guid eventMediaId, CancellationToken token)
    {
        var item = await repository.FindEventMediaAsync(eventId, eventMediaId, token); if (item is null) return false;
        repository.RemoveEventMedia(item); await repository.SaveChangesAsync(token); return true;
    }
    private async Task<EventOperationResult<AdminMediaResponse>> ChangeMedia(Guid id, Action<MediaAsset> change, CancellationToken token)
    { var item = await repository.FindMediaAsync(id, token); if (item is null) return EventOperationResult.Failure<AdminMediaResponse>("Media asset was not found."); change(item); await repository.SaveChangesAsync(token); return EventOperationResult.Success(Map(item)); }
    private static MediaOrientation GetOrientation(int? width, int? height) => width is null || height is null ? MediaOrientation.Unknown : width == height ? MediaOrientation.Square : width > height ? MediaOrientation.Landscape : MediaOrientation.Portrait;
    private static AdminMediaResponse Map(MediaAsset item) => new(item.Id, item.FileName, item.OriginalFileName, item.MediaType, item.Url, item.ThumbnailUrl, item.Width, item.Height, item.DurationSeconds, item.Orientation, item.Category, item.Caption, item.AltText, item.ApprovalStatus, item.CreatedAtUtc, item.UpdatedAtUtc);
    private static AdminMediaListItemResponse MapList(MediaAsset item) => new(item.Id, item.MediaType, item.Url, item.ThumbnailUrl, item.Orientation, item.Category, item.ApprovalStatus, item.CreatedAtUtc);
    private static EventMediaResponse Map(EventMedia item) => new(item.Id, item.EventId, item.MediaAssetId, item.Usage, item.SortOrder, item.IsFeatured, item.CreatedAtUtc);
}
