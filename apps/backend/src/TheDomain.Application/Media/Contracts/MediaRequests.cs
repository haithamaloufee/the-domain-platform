using TheDomain.Domain.Media;

namespace TheDomain.Application.Media.Contracts;

public sealed record UploadMediaCommand(Stream Content, long Length, string OriginalFileName, string ContentType,
    string? Category, string? Caption, string? AltText, MediaApprovalStatus ApprovalStatus,
    Guid? EventId, EventMediaUsage? Usage, int SortOrder, bool IsFeatured);
public sealed record UpdateMediaMetadataRequest(string? Category, string? Caption, string? AltText);
public sealed record AssignEventMediaRequest(Guid MediaAssetId, EventMediaUsage Usage, int SortOrder, bool IsFeatured);
public sealed record UpdateEventMediaRequest(EventMediaUsage Usage, int SortOrder, bool IsFeatured);
