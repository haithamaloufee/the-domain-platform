using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Application.Media;

public sealed class DisabledMediaOrganizationService : IMediaOrganizationService
{
    public Task<IReadOnlyList<MediaCollectionResponse>> ListCollectionsAsync(bool includeArchived, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollectionResponse>>([]);
    public Task<IReadOnlyList<MediaCollectionItemResponse>?> GetCollectionItemsAsync(Guid id, CancellationToken token) => Task.FromResult<IReadOnlyList<MediaCollectionItemResponse>?>(null);
    public Task<EventOperationResult<MediaCollectionResponse>> CreateCollectionAsync(SaveMediaCollectionRequest request, CancellationToken token) => CollectionDisabled();
    public Task<EventOperationResult<MediaCollectionResponse>> RenameCollectionAsync(Guid id, SaveMediaCollectionRequest request, CancellationToken token) => CollectionDisabled();
    public Task<EventOperationResult<MediaCollectionResponse>> ArchiveCollectionAsync(Guid id, CancellationToken token) => CollectionDisabled();
    public Task<EventOperationResult<MediaCollectionResponse>> RestoreCollectionAsync(Guid id, CancellationToken token) => CollectionDisabled();
    public Task<EventOperationResult<MediaCollectionResponse>> DeleteCollectionAsync(Guid id, CancellationToken token) => CollectionDisabled();
    public Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> AddToCollectionAsync(Guid id, AddMediaToCollectionRequest request, CancellationToken token) => ItemsDisabled();
    public Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> RemoveFromCollectionAsync(Guid id, Guid mediaAssetId, CancellationToken token) => ItemsDisabled();
    public Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> ReorderCollectionAsync(Guid id, ReorderMediaCollectionRequest request, CancellationToken token) => ItemsDisabled();
    public Task<EventOperationResult<AdminMediaResponse>> ArchiveMediaAsync(Guid id, CancellationToken token) => MediaDisabled();
    public Task<EventOperationResult<AdminMediaResponse>> RestoreMediaAsync(Guid id, CancellationToken token) => MediaDisabled();
    public Task<MediaUsageResponse?> GetUsageAsync(Guid id, CancellationToken token) => Task.FromResult<MediaUsageResponse?>(null);
    public Task<EventOperationResult<PermanentDeleteMediaResponse>> PermanentlyDeleteMediaAsync(Guid id, PermanentDeleteMediaRequest request, CancellationToken token) => Task.FromResult(EventOperationResult.Failure<PermanentDeleteMediaResponse>("Media persistence is not enabled."));
    private static Task<EventOperationResult<MediaCollectionResponse>> CollectionDisabled() => Task.FromResult(EventOperationResult.Failure<MediaCollectionResponse>("Media persistence is not enabled."));
    private static Task<EventOperationResult<IReadOnlyList<MediaCollectionItemResponse>>> ItemsDisabled() => Task.FromResult(EventOperationResult.Failure<IReadOnlyList<MediaCollectionItemResponse>>("Media persistence is not enabled."));
    private static Task<EventOperationResult<AdminMediaResponse>> MediaDisabled() => Task.FromResult(EventOperationResult.Failure<AdminMediaResponse>("Media persistence is not enabled."));
}
