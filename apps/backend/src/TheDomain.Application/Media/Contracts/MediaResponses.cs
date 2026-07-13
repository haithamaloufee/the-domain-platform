using TheDomain.Domain.Media;

namespace TheDomain.Application.Media.Contracts;

public sealed record AdminMediaListItemResponse(Guid Id, MediaType MediaType, string Url, string? ThumbnailUrl,
    MediaOrientation Orientation, string? Category, MediaApprovalStatus ApprovalStatus, DateTimeOffset CreatedAtUtc);
public sealed record AdminMediaResponse(Guid Id, string FileName, string OriginalFileName, MediaType MediaType,
    string Url, string? ThumbnailUrl, int? Width, int? Height, decimal? DurationSeconds,
    MediaOrientation Orientation, string? Category, string? Caption, string? AltText,
    MediaApprovalStatus ApprovalStatus, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record EventMediaResponse(Guid Id, Guid EventId, Guid MediaAssetId, EventMediaUsage Usage, int SortOrder, bool IsFeatured, DateTimeOffset CreatedAtUtc);
