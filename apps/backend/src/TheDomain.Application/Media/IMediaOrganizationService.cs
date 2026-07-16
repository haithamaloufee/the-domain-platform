using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Application.Media;

public interface IMediaOrganizationService
{
    Task<IReadOnlyList<MediaCollectionResponse>> ListCollectionsAsync(bool includeArchived, CancellationToken token);
    Task<IReadOnlyList<MediaCollectionItemResponse>?> GetCollectionItemsAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<MediaCollectionResponse>> CreateCollectionAsync(SaveMediaCollectionRequest request, CancellationToken token);
    Task<EventOperationResult<MediaCollectionResponse>> RenameCollectionAsync(Guid id, SaveMediaCollectionRequest request, CancellationToken token);
    Task<EventOperationResult<MediaCollectionResponse>> ArchiveCollectionAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<MediaCollectionResponse>> RestoreCollectionAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<MediaCollectionResponse>> DeleteCollectionAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> AddToCollectionAsync(Guid id, AddMediaToCollectionRequest request, CancellationToken token);
    Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> RemoveFromCollectionAsync(Guid id, Guid mediaAssetId, CancellationToken token);
    Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> ReorderCollectionAsync(Guid id, ReorderMediaCollectionRequest request, CancellationToken token);
    Task<EventOperationResult<AdminMediaResponse>> ArchiveMediaAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<AdminMediaResponse>> RestoreMediaAsync(Guid id, CancellationToken token);
    Task<MediaUsageResponse?> GetUsageAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<PermanentDeleteMediaResponse>> PermanentlyDeleteMediaAsync(Guid id, PermanentDeleteMediaRequest request, CancellationToken token);
}
