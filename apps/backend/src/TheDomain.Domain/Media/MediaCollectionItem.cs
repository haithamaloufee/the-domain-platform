namespace TheDomain.Domain.Media;

public sealed class MediaCollectionItem
{
    private MediaCollectionItem() { }
    public MediaCollectionItem(Guid collectionId, Guid mediaAssetId, int sortOrder, DateTimeOffset createdAtUtc)
    {
        CollectionId = collectionId; MediaAssetId = mediaAssetId; SetSortOrder(sortOrder); CreatedAtUtc = createdAtUtc;
    }
    public Guid CollectionId { get; private set; }
    public Guid MediaAssetId { get; private set; }
    public int SortOrder { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public MediaCollection Collection { get; private set; } = null!;
    public MediaAsset MediaAsset { get; private set; } = null!;
    public void SetSortOrder(int value) { ArgumentOutOfRangeException.ThrowIfNegative(value); SortOrder = value; }
}
