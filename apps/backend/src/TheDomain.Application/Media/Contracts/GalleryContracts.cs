using TheDomain.Domain.Media;

namespace TheDomain.Application.Media.Contracts;

public sealed record SaveGalleryCollectionPresentationRequest(string? Title, string? Description,
    GalleryLayoutPreset LayoutPreset, Guid? FeaturedMediaAssetId);
public sealed record ReorderGalleryCollectionsRequest(IReadOnlyList<Guid> CollectionIds);
public sealed record GalleryAdminMediaResponse(Guid Id, string OriginalFileName, MediaType MediaType,
    string Url, string? PosterUrl, string? Caption, string? AltText, MediaApprovalStatus ApprovalStatus,
    bool IsArchived, int SortOrder, bool IsPubliclyEligible, string? ExclusionReason);
public sealed record GalleryAdminCollectionResponse(Guid Id, string Name, bool IsArchived,
    bool IsPublished, int GallerySortOrder, string? PublicTitle, string? PublicDescription,
    GalleryLayoutPreset LayoutPreset, Guid? FeaturedMediaAssetId, int TotalMediaCount,
    int EligibleMediaCount, IReadOnlyList<GalleryAdminMediaResponse> Media);
public sealed record GalleryPublicMediaResponse(Guid Id, MediaType MediaType, string Url, string? PosterUrl,
    string? Caption, string? AltText, MediaOrientation Orientation, int? Width, int? Height,
    decimal? DurationSeconds, int SortOrder);
public sealed record GalleryPublicCollectionResponse(Guid Id, string Title, string? Description,
    GalleryLayoutPreset LayoutPreset, Guid? FeaturedMediaId, IReadOnlyList<GalleryPublicMediaResponse> Media);

public sealed record GalleryMediaPageResponse(GalleryPublicCollectionResponse Collection, int? NextOffset);
public sealed record GalleryCollectionSummaryResponse(string Kind, Guid Id, string Title, string? Description,
    GalleryLayoutPreset LayoutPreset, int HighlightCount, int PhotoCount, int VideoCount, GalleryPublicMediaResponse? CoverMedia);
