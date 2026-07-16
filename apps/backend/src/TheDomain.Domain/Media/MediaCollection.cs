using System.Diagnostics.CodeAnalysis;

namespace TheDomain.Domain.Media;

[SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix", Justification = "Collection is the product's domain term for an organized media group.")]
public sealed class MediaCollection
{
    private MediaCollection() { }
    public MediaCollection(Guid id, string name, DateTimeOffset createdAtUtc)
    {
        Id = id;
        Rename(name, createdAtUtc);
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public bool IsArchived { get; private set; }
    public DateTimeOffset? ArchivedAtUtc { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public bool IsPublishedInGallery { get; private set; }
    public int GallerySortOrder { get; private set; }
    public string? GalleryTitle { get; private set; }
    public string? GalleryDescription { get; private set; }
    public GalleryLayoutPreset GalleryLayoutPreset { get; private set; } = GalleryLayoutPreset.Editorial;
    public Guid? GalleryFeaturedMediaAssetId { get; private set; }
    public ICollection<MediaCollectionItem> Items { get; private set; } = [];

    public void Rename(string name, DateTimeOffset now)
    {
        var normalized = name.Trim();
        if (normalized.Length is < 1 or > 120) throw new ArgumentException("Collection name must be between 1 and 120 characters.", nameof(name));
        Name = normalized;
        UpdatedAtUtc = now;
    }
    public void Archive(DateTimeOffset now) { IsArchived = true; ArchivedAtUtc = now; UpdatedAtUtc = now; }
    public void Restore(DateTimeOffset now) { IsArchived = false; ArchivedAtUtc = null; UpdatedAtUtc = now; }
    public void PublishToGallery(int sortOrder, DateTimeOffset now) { if (IsArchived) throw new InvalidOperationException("Archived collections cannot be published."); IsPublishedInGallery = true; SetGallerySortOrder(sortOrder); UpdatedAtUtc = now; }
    public void UnpublishFromGallery(DateTimeOffset now) { IsPublishedInGallery = false; UpdatedAtUtc = now; }
    public void SetGallerySortOrder(int value) { ArgumentOutOfRangeException.ThrowIfNegative(value); GallerySortOrder = value; }
    public void UpdateGalleryPresentation(string? title, string? description, GalleryLayoutPreset preset, Guid? featuredMediaAssetId, DateTimeOffset now)
    {
        if (!Enum.IsDefined(preset)) throw new ArgumentOutOfRangeException(nameof(preset));
        var normalizedTitle = string.IsNullOrWhiteSpace(title) ? null : title.Trim();
        var normalizedDescription = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (normalizedTitle?.Length > 120) throw new ArgumentException("Gallery title must not exceed 120 characters.", nameof(title));
        if (normalizedDescription?.Length > 500) throw new ArgumentException("Gallery description must not exceed 500 characters.", nameof(description));
        GalleryTitle = normalizedTitle; GalleryDescription = normalizedDescription; GalleryLayoutPreset = preset;
        GalleryFeaturedMediaAssetId = featuredMediaAssetId; UpdatedAtUtc = now;
    }
    public void ResetGalleryPresentation(DateTimeOffset now) => UpdateGalleryPresentation(null, null, GalleryLayoutPreset.Editorial, null, now);
}
