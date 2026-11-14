using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;
namespace TheDomain.Application.Media;
public sealed class DisabledGalleryService : IGalleryService
{
    public Task<IReadOnlyList<GalleryAdminCollectionResponse>> GetAdminAsync(CancellationToken token) => Task.FromResult<IReadOnlyList<GalleryAdminCollectionResponse>>([]);
    public Task<IReadOnlyList<GalleryPublicCollectionResponse>> GetPublicAsync(CancellationToken token) => Task.FromResult<IReadOnlyList<GalleryPublicCollectionResponse>>([]);
    public Task<GalleryPublicCollectionResponse?> GetPublicByIdAsync(Guid id, CancellationToken token) => Task.FromResult<GalleryPublicCollectionResponse?>(null);
    public Task<GalleryMediaPageResponse?> GetPublicMediaPageAsync(Guid id, int offset, CancellationToken token) => Task.FromResult<GalleryMediaPageResponse?>(null);
    public Task<IReadOnlyList<GalleryCollectionSummaryResponse>> GetPublicSummariesAsync(CancellationToken token) =>
        Task.FromResult<IReadOnlyList<GalleryCollectionSummaryResponse>>([]);
    public Task<EventOperationResult<GalleryAdminCollectionResponse>> PublishAsync(Guid id, CancellationToken token) => One();
    public Task<EventOperationResult<GalleryAdminCollectionResponse>> UnpublishAsync(Guid id, CancellationToken token) => One();
    public Task<EventOperationResult<IReadOnlyList<GalleryAdminCollectionResponse>>> ReorderAsync(ReorderGalleryCollectionsRequest request, CancellationToken token) => Task.FromResult(EventOperationResult.Failure<IReadOnlyList<GalleryAdminCollectionResponse>>("Gallery persistence is not enabled."));
    public Task<EventOperationResult<GalleryAdminCollectionResponse>> SavePresentationAsync(Guid id, SaveGalleryCollectionPresentationRequest request, CancellationToken token) => One();
    public Task<EventOperationResult<GalleryAdminCollectionResponse>> ResetPresentationAsync(Guid id, CancellationToken token) => One();
    private static Task<EventOperationResult<GalleryAdminCollectionResponse>> One() => Task.FromResult(EventOperationResult.Failure<GalleryAdminCollectionResponse>("Gallery persistence is not enabled."));
}
