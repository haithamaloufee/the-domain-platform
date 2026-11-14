using TheDomain.Domain.Media;

namespace TheDomain.Application.Media.Contracts;

public sealed record UploadMediaCommand(Stream Content, long Length, string OriginalFileName, string ContentType,
    string? Category, string? Caption, string? AltText, MediaApprovalStatus ApprovalStatus,
    Guid? EventId, EventMediaUsage? Usage, int SortOrder, bool IsFeatured);
public sealed record UpdateMediaMetadataRequest(string? Category, string? Caption, string? AltText);
public sealed record AssignEventMediaRequest(Guid MediaAssetId, EventMediaUsage Usage, int SortOrder, bool IsFeatured);
public sealed record UpdateEventMediaRequest(EventMediaUsage Usage, int SortOrder, bool IsFeatured);
public sealed record ReorderEventMediaRequest(IReadOnlyList<Guid> EventMediaIds);
public sealed record UpdateEventCoverPresentationRequest(double FocalPointX, double FocalPointY, double Zoom);
public sealed record UpdateVideoPosterRequest(VideoPosterMode Mode, decimal? TimestampSeconds, Guid? CustomPosterMediaAssetId);
public sealed record SaveMediaCollectionRequest(string Name);
public sealed record AddMediaToCollectionRequest(Guid MediaAssetId);
public sealed record ReorderMediaCollectionRequest(IReadOnlyList<Guid> MediaAssetIds);
public sealed record PermanentDeleteMediaRequest(string Confirmation);
