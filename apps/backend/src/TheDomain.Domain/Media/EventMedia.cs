using TheDomain.Domain.Events;

namespace TheDomain.Domain.Media;

public sealed class EventMedia
{
    private EventMedia() { }
    public EventMedia(Guid id, Guid eventId, Guid mediaAssetId, EventMediaUsage usage, int sortOrder, bool isFeatured, DateTimeOffset createdAtUtc)
    { Id = id; EventId = eventId; MediaAssetId = mediaAssetId; Usage = usage; SortOrder = sortOrder; IsFeatured = isFeatured; CreatedAtUtc = createdAtUtc; }
    public Guid Id { get; private set; }
    public Guid EventId { get; private set; }
    public Guid MediaAssetId { get; private set; }
    public EventMediaUsage Usage { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsFeatured { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public EntertainmentEvent Event { get; private set; } = null!;
    public MediaAsset MediaAsset { get; private set; } = null!;

    public void Update(EventMediaUsage usage, int sortOrder, bool isFeatured)
    {
        Usage = usage; SortOrder = sortOrder; IsFeatured = isFeatured;
    }

    internal void AttachTo(EntertainmentEvent eventEntity, MediaAsset mediaAsset)
    {
        Event = eventEntity; MediaAsset = mediaAsset;
    }
}
