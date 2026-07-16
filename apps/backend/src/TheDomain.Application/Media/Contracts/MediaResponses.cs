using TheDomain.Domain.Media;

namespace TheDomain.Application.Media.Contracts;

public sealed record AdminMediaListItemResponse(Guid Id, string FileName, string OriginalFileName,
    MediaType MediaType, string Url, string? ThumbnailUrl, MediaOrientation Orientation, string? Category,
    string? Caption, string? AltText, MediaApprovalStatus ApprovalStatus, bool IsArchived,
    DateTimeOffset? ArchivedAtUtc, DateTimeOffset CreatedAtUtc);
public sealed record AdminMediaResponse(Guid Id, string FileName, string OriginalFileName, MediaType MediaType,
    string Url, string? ThumbnailUrl, int? Width, int? Height, decimal? DurationSeconds,
    MediaOrientation Orientation, string? Category, string? Caption, string? AltText,
    MediaApprovalStatus ApprovalStatus, bool IsArchived, DateTimeOffset? ArchivedAtUtc,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record EventCoverPresentationResponse(double FocalPointX, double FocalPointY, double Zoom);
public sealed record VideoPosterPresentationResponse(VideoPosterMode Mode, decimal? TimestampSeconds,
    Guid? CustomPosterMediaAssetId, string? PosterUrl);
public sealed record EventMediaResponse(Guid Id, Guid EventId, Guid MediaAssetId, EventMediaUsage Usage,
    int SortOrder, bool IsFeatured, DateTimeOffset CreatedAtUtc, EventCoverPresentationResponse Presentation,
    VideoPosterPresentationResponse VideoPoster);
public sealed record AdminEventMediaResponse(Guid Id, Guid EventId, Guid MediaAssetId, EventMediaUsage Usage,
    int SortOrder, bool IsFeatured, DateTimeOffset CreatedAtUtc, EventCoverPresentationResponse Presentation,
    VideoPosterPresentationResponse VideoPoster,
    AdminMediaResponse Media);
public sealed record MediaCollectionResponse(Guid Id, string Name, bool IsArchived, int ItemCount,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc, DateTimeOffset? ArchivedAtUtc);
public sealed record MediaCollectionItemResponse(Guid MediaAssetId, int SortOrder, AdminMediaListItemResponse Media);
public sealed record MediaUsageEventResponse(Guid EventId, string EventTitle, EventMediaUsage Usage, bool IsCustomPoster);
public sealed record MediaUsageResponse(Guid MediaAssetId, IReadOnlyList<MediaUsageEventResponse> Events,
    IReadOnlyList<MediaCollectionResponse> Collections, bool CanPermanentlyDelete);
public sealed record PermanentDeleteMediaResponse(Guid Id, string OriginalFileName);
