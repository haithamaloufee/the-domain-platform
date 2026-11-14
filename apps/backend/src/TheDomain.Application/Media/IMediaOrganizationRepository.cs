using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public interface IMediaOrganizationRepository
{
    Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool includeArchived, CancellationToken token);
    Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token);
    Task<bool> CollectionNameExistsAsync(string name, Guid? excludingId, CancellationToken token);
    Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token);
    Task<IReadOnlyList<MediaCollectionItem>> ListCollectionItemsAsync(Guid collectionId, bool tracking, CancellationToken token);
    Task<MediaUsageResponse?> GetUsageAsync(Guid mediaAssetId, CancellationToken token);
    void AddCollection(MediaCollection collection);
    void AddCollectionItem(MediaCollectionItem item);
    void RemoveCollection(MediaCollection collection);
    void RemoveCollectionItem(MediaCollectionItem item);
    void RemoveMedia(MediaAsset media);
    Task SaveChangesAsync(CancellationToken token);
}
