using TheDomain.Domain.Events;

namespace TheDomain.Domain.Media;

public sealed class EventMedia
{
    public const double DefaultFocalPoint = 0.5;
    public const double DefaultZoom = 1.0;
    public const double MinimumFocalPoint = 0.0;
    public const double MaximumFocalPoint = 1.0;
    public const double MinimumZoom = 1.0;
    public const double MaximumZoom = 3.0;

    private EventMedia() { }
    public EventMedia(Guid id, Guid eventId, Guid mediaAssetId, EventMediaUsage usage, int sortOrder,
        bool isFeatured, DateTimeOffset createdAtUtc, double focalPointX = DefaultFocalPoint,
        double focalPointY = DefaultFocalPoint, double zoom = DefaultZoom)
    {
        Id = id;
        EventId = eventId;
        MediaAssetId = mediaAssetId;
        Usage = usage;
        SortOrder = sortOrder;
        IsFeatured = isFeatured;
        CreatedAtUtc = createdAtUtc;
        UpdatePresentation(focalPointX, focalPointY, zoom);
    }
    public Guid Id { get; private set; }
    public Guid EventId { get; private set; }
    public Guid MediaAssetId { get; private set; }
    public EventMediaUsage Usage { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsFeatured { get; private set; }
    public double FocalPointX { get; private set; } = DefaultFocalPoint;
    public double FocalPointY { get; private set; } = DefaultFocalPoint;
    public double Zoom { get; private set; } = DefaultZoom;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public EntertainmentEvent Event { get; private set; } = null!;
    public MediaAsset MediaAsset { get; private set; } = null!;

    public void Update(EventMediaUsage usage, int sortOrder, bool isFeatured)
    {
        Usage = usage; SortOrder = sortOrder; IsFeatured = isFeatured;
    }

    public void UpdatePresentation(double focalPointX, double focalPointY, double zoom)
    {
        if (!IsValidFocalPoint(focalPointX))
            throw new ArgumentOutOfRangeException(nameof(focalPointX));
        if (!IsValidFocalPoint(focalPointY))
            throw new ArgumentOutOfRangeException(nameof(focalPointY));
        if (!double.IsFinite(zoom) || zoom is < MinimumZoom or > MaximumZoom)
            throw new ArgumentOutOfRangeException(nameof(zoom));

        FocalPointX = focalPointX;
        FocalPointY = focalPointY;
        Zoom = zoom;
    }

    public static bool IsValidFocalPoint(double value) =>
        double.IsFinite(value) && value is >= MinimumFocalPoint and <= MaximumFocalPoint;

    internal void AttachTo(EntertainmentEvent eventEntity, MediaAsset mediaAsset)
    {
        Event = eventEntity; MediaAsset = mediaAsset;
    }
}
