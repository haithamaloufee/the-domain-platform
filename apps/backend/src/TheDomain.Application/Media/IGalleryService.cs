using TheDomain.Application.Events;
using TheDomain.Application.Media.Contracts;
namespace TheDomain.Application.Media;
public interface IGalleryService
{
    Task<IReadOnlyList<GalleryAdminCollectionResponse>> GetAdminAsync(CancellationToken token);
    Task<IReadOnlyList<GalleryPublicCollectionResponse>> GetPublicAsync(CancellationToken token);
    Task<GalleryPublicCollectionResponse?> GetPublicByIdAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<GalleryAdminCollectionResponse>> PublishAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<GalleryAdminCollectionResponse>> UnpublishAsync(Guid id, CancellationToken token);
    Task<EventOperationResult<IReadOnlyList<GalleryAdminCollectionResponse>>> ReorderAsync(ReorderGalleryCollectionsRequest request, CancellationToken token);
    Task<EventOperationResult<GalleryAdminCollectionResponse>> SavePresentationAsync(Guid id, SaveGalleryCollectionPresentationRequest request, CancellationToken token);
    Task<EventOperationResult<GalleryAdminCollectionResponse>> ResetPresentationAsync(Guid id, CancellationToken token);
}
