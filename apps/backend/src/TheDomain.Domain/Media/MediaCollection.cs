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
}
