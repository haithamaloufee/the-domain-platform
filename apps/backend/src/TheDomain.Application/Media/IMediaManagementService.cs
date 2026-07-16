using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Application.Media;

public interface IMediaManagementService
{
    Task<EventOperationResult<AdminMediaResponse>> UploadAsync(UploadMediaCommand command, CancellationToken token);
    Task<EventOperationResult<AdminMediaResponse>> UpdateMetadataAsync(Guid id, UpdateMediaMetadataRequest request, CancellationToken token);
    Task<EventOperationResult<AdminMediaResponse>> ApproveAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<AdminMediaResponse>> HideAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<EventMediaResponse>> AssignAsync(Guid eventId, AssignEventMediaRequest request, CancellationToken token);
    Task<EventOperationResult<EventMediaResponse>> UpdateAssignmentAsync(Guid eventId, Guid eventMediaId, UpdateEventMediaRequest request, CancellationToken token);
    Task<EventOperationResult<EventMediaResponse>> SetCoverAsync(Guid eventId, Guid eventMediaId, CancellationToken token);
    Task<EventOperationResult<EventMediaResponse>> UpdateCoverPresentationAsync(Guid eventId,
        Guid eventMediaId, UpdateEventCoverPresentationRequest request, CancellationToken token);
    Task<EventOperationResult<EventMediaResponse>> UpdateVideoPosterAsync(Guid eventId,
        Guid eventMediaId, UpdateVideoPosterRequest request, CancellationToken token);
    Task<EventOperationResult<IReadOnlyList<EventMediaResponse>>> ReorderAsync(Guid eventId, ReorderEventMediaRequest request, CancellationToken token);
    Task<bool> RemoveAssignmentAsync(Guid eventId, Guid eventMediaId, CancellationToken token);
}
