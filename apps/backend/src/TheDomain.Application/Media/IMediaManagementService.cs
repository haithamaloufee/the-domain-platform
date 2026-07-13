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
    Task<bool> RemoveAssignmentAsync(Guid eventId, Guid eventMediaId, CancellationToken token);
}
