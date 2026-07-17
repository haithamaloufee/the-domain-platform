namespace TheDomain.Application.Homepage.Contracts;

public sealed record UpdateHomepageContentRequest(
    string HeroEyebrow,
    string HeroTitle,
    string? HeroAccent,
    string HeroDescription,
    string PrimaryCtaLabel,
    string PrimaryCtaHref,
    string? SecondaryCtaLabel,
    string? SecondaryCtaHref,
    string WhyTitle,
    string WhyDescription,
    string ServicesTitle,
    string ServicesDescription,
    string PartnersTitle,
    string PartnersDescription,
    string ContactTitle,
    string ContactDescription,
    string ContactCtaLabel,
    string ContactCtaHref,
    bool IsPublished,
    Guid? HeroMediaAssetId = null,
    Guid? GalleryCollectionId = null,
    IReadOnlyList<string>? SectionOrder = null,
    IReadOnlyList<string>? DisabledSections = null,
    string? EventsTitle = null,
    string? EventsDescription = null,
    string? PreviousEventsTitle = null,
    string? PreviousEventsDescription = null,
    string? GalleryTitle = null,
    string? GalleryDescription = null,
    bool IsFloatingVideoEnabled = false,
    Guid? FloatingVideoMediaAssetId = null,
    Guid? FloatingVideoPosterMediaAssetId = null);

public sealed record SaveStatisticRequest(
    string Label,
    string Value,
    string? Suffix,
    string? Description,
    int SortOrder,
    bool IsVisible,
    bool IsVerified);

public sealed record SavePartnerRequest(
    string Name,
    string Slug,
    string? LogoUrl,
    string? WebsiteUrl,
    string? Description,
    int SortOrder,
    bool IsVisible,
    bool IsFeatured,
    Guid? LogoMediaAssetId = null);
public sealed record ReorderHomepageItemsRequest(IReadOnlyList<Guid> Ids);
public sealed record SaveStatisticsPresentationRequest(string Phrase, bool IsEnabled);
