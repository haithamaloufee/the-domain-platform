using TheDomain.Domain.Media;
namespace TheDomain.Application.Media;
public interface IGalleryRepository
{
    Task<IReadOnlyList<MediaCollection>> ListCollectionsAsync(bool tracking, CancellationToken token);
    Task<MediaCollection?> FindCollectionAsync(Guid id, bool tracking, CancellationToken token);
    Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(Guid collectionId, CancellationToken token);
    Task<IReadOnlyList<MediaCollectionItem>> ListItemsAsync(IReadOnlyCollection<Guid> collectionIds, CancellationToken token);
    Task<IReadOnlyList<MediaCollectionItem>> ListPublicItemsAsync(Guid collectionId, int offset, int limit, CancellationToken token);
    Task<IReadOnlyList<PublicGalleryCollectionRead>> ListPublicSummariesAsync(CancellationToken token);
    Task SaveChangesAsync(CancellationToken token);
}

public sealed record PublicGalleryCollectionRead(
    Guid Id, string Title, string? Description, GalleryLayoutPreset LayoutPreset,
    int PhotoCount, int VideoCount, MediaCollectionItem? Cover);
