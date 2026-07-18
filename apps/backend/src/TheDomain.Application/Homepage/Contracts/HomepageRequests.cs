namespace TheDomain.Application.Homepage.Contracts;

public sealed record UpdateHomepageContentRequest(bool IsPublished,
    Guid? HeroMediaAssetId = null, Guid? GalleryCollectionId = null,
    bool IsFloatingVideoEnabled = false, Guid? FloatingVideoMediaAssetId = null,
    Guid? FloatingVideoPosterMediaAssetId = null);
public sealed record SaveStatisticRequest(string Label, string Value, string? Suffix,
    string? Description, int SortOrder, bool IsVisible, bool IsVerified);
public sealed record SavePartnerRequest(string Name, string Slug, string? LogoUrl,
    string? WebsiteUrl, string? Description, int SortOrder, bool IsVisible,
    bool IsFeatured, Guid? LogoMediaAssetId = null);
public sealed record ReorderHomepageItemsRequest(IReadOnlyList<Guid> Ids);
public sealed record SaveStatisticsPresentationRequest(bool IsEnabled);
