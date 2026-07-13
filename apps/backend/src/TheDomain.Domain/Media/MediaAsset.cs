namespace TheDomain.Domain.Media;

public sealed class MediaAsset
{
    private MediaAsset() { }
    public MediaAsset(Guid id, string fileName, string originalFileName, MediaType mediaType, string url,
        string? thumbnailUrl, int? width, int? height, decimal? durationSeconds, MediaOrientation orientation,
        string? category, string? caption, string? altText, MediaApprovalStatus approvalStatus,
        string? cloudinaryPublicId, DateTimeOffset createdAtUtc)
    {
        if (!Enum.IsDefined(mediaType)) throw new ArgumentOutOfRangeException(nameof(mediaType));
        if (!Uri.TryCreate(url, UriKind.Absolute, out var mediaUri) || mediaUri.Scheme is not ("http" or "https")) throw new ArgumentException("Media URL must be an absolute HTTP or HTTPS URL.", nameof(url));
        if (!string.IsNullOrWhiteSpace(thumbnailUrl) && (!Uri.TryCreate(thumbnailUrl, UriKind.Absolute, out var thumbnailUri) || thumbnailUri.Scheme is not ("http" or "https"))) throw new ArgumentException("Thumbnail URL must be an absolute HTTP or HTTPS URL.", nameof(thumbnailUrl));
        if (width <= 0) throw new ArgumentOutOfRangeException(nameof(width));
        if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
        if (durationSeconds < 0) throw new ArgumentOutOfRangeException(nameof(durationSeconds));
        Id = id; FileName = fileName; OriginalFileName = originalFileName; MediaType = mediaType; Url = url;
        ThumbnailUrl = thumbnailUrl; Width = width; Height = height; DurationSeconds = durationSeconds;
        Orientation = orientation; Category = category; Caption = caption; AltText = altText;
        ApprovalStatus = approvalStatus; CloudinaryPublicId = cloudinaryPublicId;
        CreatedAtUtc = createdAtUtc; UpdatedAtUtc = createdAtUtc;
    }
    public Guid Id { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string OriginalFileName { get; private set; } = string.Empty;
    public MediaType MediaType { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public string? ThumbnailUrl { get; private set; }
    public int? Width { get; private set; }
    public int? Height { get; private set; }
    public decimal? DurationSeconds { get; private set; }
    public MediaOrientation Orientation { get; private set; }
    public string? Category { get; private set; }
    public string? Caption { get; private set; }
    public string? AltText { get; private set; }
    public MediaApprovalStatus ApprovalStatus { get; private set; }
    public string? CloudinaryPublicId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void UpdateMetadata(string? category, string? caption, string? altText, DateTimeOffset now)
    {
        Category = category; Caption = caption; AltText = altText; UpdatedAtUtc = now;
    }

    public void Approve(DateTimeOffset now) { ApprovalStatus = MediaApprovalStatus.Approved; UpdatedAtUtc = now; }
    public void Hide(DateTimeOffset now) { ApprovalStatus = MediaApprovalStatus.Hidden; UpdatedAtUtc = now; }
}
