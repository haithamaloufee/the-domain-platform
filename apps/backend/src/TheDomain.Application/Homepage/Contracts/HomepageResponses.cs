using TheDomain.Application.Events.Contracts;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Homepage.Contracts;

public sealed record HomepageMediaSummaryResponse(Guid Id, MediaType MediaType, string Url,
    string? PosterUrl, string? AltText);
public sealed record HomepageFloatingVideoResponse(HomepageMediaSummaryResponse Video,
    HomepageMediaSummaryResponse? Poster);
public sealed record HomepagePresentationResponse(HomepageMediaSummaryResponse? HeroMedia,
    HomepageFloatingVideoResponse? FloatingVideo, bool StatisticsMotionEnabled);
public sealed record HomepageStatisticResponse(int SlotNumber, string Value, string? Suffix);
public sealed record HomepageCollectionPreviewResponse(Guid Id, string Title, string? Description,
    GalleryLayoutPreset LayoutPreset, int HighlightCount, int PhotoCount, int VideoCount,
    HomepageMediaSummaryResponse? CoverMedia);
public sealed record HomepageGalleryPreviewResponse(string Kind,
    HomepageCollectionPreviewResponse? Collection, IReadOnlyList<GalleryAlbumListResponse> Albums);

public sealed record PublicStatisticResponse(string Label, string Value, string? Suffix,
    string? Description);
public sealed record StatisticsPresentationResponse(bool IsEnabled);
public sealed record PublicPartnerResponse(string Name, string Slug, string? LogoUrl,
    string? WebsiteUrl, string? Description, bool IsFeatured);

public sealed record PublicHomepageResponse(HomepagePresentationResponse Presentation,
    IReadOnlyList<HomepageStatisticResponse> Statistics,
    IReadOnlyList<PublicEventListResponse> CurrentEvents,
    IReadOnlyList<PublicEventListResponse> PreviousEvents,
    HomepageGalleryPreviewResponse? GalleryPreview,
    IReadOnlyList<PublicPartnerResponse> Partners);

public sealed record HomepageBuilderResponse(Guid? HeroMediaAssetId, Guid? GalleryCollectionId,
    HomepageMediaSummaryResponse? HeroMedia, bool IsFloatingVideoEnabled,
    Guid? FloatingVideoMediaAssetId, Guid? FloatingVideoPosterMediaAssetId,
    HomepageMediaSummaryResponse? FloatingVideoMedia, HomepageMediaSummaryResponse? FloatingVideoPoster);
public sealed record AdminHomepageContentResponse(Guid Id, bool IsPublished,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc, HomepageBuilderResponse Builder);
public sealed record AdminStatisticResponse(Guid Id, int SlotNumber, string Label, string Value,
    string? Suffix, string? Description, int SortOrder, bool IsVisible, bool IsVerified,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record AdminPartnerResponse(Guid Id, string Name, string Slug, string? LogoUrl,
    string? WebsiteUrl, string? Description, int SortOrder, bool IsVisible, bool IsFeatured,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc, Guid? LogoMediaAssetId);
