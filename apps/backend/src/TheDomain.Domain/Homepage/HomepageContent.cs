namespace TheDomain.Domain.Homepage;

public sealed class HomepageContent
{
    public static readonly Guid SingletonId = Guid.Parse("6f44ac8f-0cc7-4caf-988d-5e666469f48e");

    private HomepageContent() { }

    public HomepageContent(Guid id, bool isPublished, DateTimeOffset createdAtUtc)
    {
        if (id != SingletonId) throw new ArgumentException("Homepage content must use the singleton identifier.", nameof(id));
        Id = id;
        IsPublished = isPublished;
        CreatedAtUtc = UpdatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public bool IsPublished { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public bool IsStatisticsPhraseEnabled { get; private set; } = true;
    public Guid? HeroMediaAssetId { get; private set; }
    public Guid? GalleryCollectionId { get; private set; }
    public bool IsFloatingVideoEnabled { get; private set; }
    public Guid? FloatingVideoMediaAssetId { get; private set; }
    public Guid? FloatingVideoPosterMediaAssetId { get; private set; }

    public void UpdatePublication(bool isPublished, DateTimeOffset now)
    {
        IsPublished = isPublished;
        UpdatedAtUtc = now;
    }

    public void UpdateStatisticsPresentation(bool enabled, DateTimeOffset now)
    {
        IsStatisticsPhraseEnabled = enabled;
        UpdatedAtUtc = now;
    }

    public void UpdateBuilder(Guid? heroMediaAssetId, Guid? galleryCollectionId,
        bool isFloatingVideoEnabled, Guid? floatingVideoMediaAssetId,
        Guid? floatingVideoPosterMediaAssetId,
        DateTimeOffset now)
    {
        HeroMediaAssetId = heroMediaAssetId;
        GalleryCollectionId = galleryCollectionId;
        IsFloatingVideoEnabled = isFloatingVideoEnabled;
        FloatingVideoMediaAssetId = floatingVideoMediaAssetId;
        FloatingVideoPosterMediaAssetId = floatingVideoPosterMediaAssetId;
        UpdatedAtUtc = now;
    }
}
