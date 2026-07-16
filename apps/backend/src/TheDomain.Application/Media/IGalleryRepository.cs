using TheDomain.Domain.Media;
namespace TheDomain.Application.Media;
public interface IGalleryRepository
{
    Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool tracking, CancellationToken token);
    Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token);
    Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(Guid collectionId, CancellationToken token);
    Task SaveChangesAsync(CancellationToken token);
}
