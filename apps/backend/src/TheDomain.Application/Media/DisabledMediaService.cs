using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Application.Media;

public sealed class DisabledMediaService : IMediaManagementService, IMediaQueryService
{
    public Task<PagedResponse<AdminMediaListItemResponse>> GetAsync(MediaListQuery query, CancellationToken token) => Task.FromResult(new PagedResponse<AdminMediaListItemResponse>(1, Math.Clamp(query.PageSize, 1, 50), 0, 0, false, false, []));
    public Task<AdminMediaResponse?> GetByIdAsync(Guid id, CancellationToken token) => Task.FromResult<AdminMediaResponse?>(null);
    public Task<EventOperationResult<AdminMediaResponse>> UploadAsync(UploadMediaCommand command, CancellationToken token) => MediaDisabled();
    public Task<EventOperationResult<AdminMediaResponse>> UpdateMetadataAsync(Guid id, UpdateMediaMetadataRequest request, CancellationToken token) => MediaDisabled();
    public Task<EventOperationResult<AdminMediaResponse>> ApproveAsync(Guid id, CancellationToken token) => MediaDisabled();
    public Task<EventOperationResult<AdminMediaResponse>> HideAsync(Guid id, CancellationToken token) => MediaDisabled();
    public Task<EventOperationResult<EventMediaResponse>> AssignAsync(Guid eventId, AssignEventMediaRequest request, CancellationToken token) => AssignmentDisabled();
    public Task<EventOperationResult<EventMediaResponse>> UpdateAssignmentAsync(Guid eventId, Guid eventMediaId, UpdateEventMediaRequest request, CancellationToken token) => AssignmentDisabled();
    public Task<bool> RemoveAssignmentAsync(Guid eventId, Guid eventMediaId, CancellationToken token) => Task.FromResult(false);
    private static Task<EventOperationResult<AdminMediaResponse>> MediaDisabled() => Task.FromResult(EventOperationResult.Failure<AdminMediaResponse>("Media persistence is not enabled."));
    private static Task<EventOperationResult<EventMediaResponse>> AssignmentDisabled() => Task.FromResult(EventOperationResult.Failure<EventMediaResponse>("Media persistence is not enabled."));
}
