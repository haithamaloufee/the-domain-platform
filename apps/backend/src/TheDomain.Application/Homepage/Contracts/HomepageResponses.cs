namespace TheDomain.Application.Homepage.Contracts;

public sealed record HomepageHeroMediaResponse(Guid Id, TheDomain.Domain.Media.MediaType MediaType, string Url, string? PosterUrl, string? AltText);
public sealed record HomepageBuilderResponse(
    Guid? HeroMediaAssetId,
    Guid? GalleryCollectionId,
    HomepageHeroMediaResponse? HeroMedia,
    bool IsFloatingVideoEnabled,
    Guid? FloatingVideoMediaAssetId,
    Guid? FloatingVideoPosterMediaAssetId,
    HomepageHeroMediaResponse? FloatingVideoMedia,
    HomepageHeroMediaResponse? FloatingVideoPoster,
    IReadOnlyList<string> SectionOrder,
    IReadOnlyList<string> DisabledSections,
    string EventsTitle,
    string EventsDescription,
    string PreviousEventsTitle,
    string PreviousEventsDescription,
    string GalleryTitle,
    string GalleryDescription);
public sealed record PublicHomepageContentResponse(
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
    HomepageBuilderResponse Builder);

public sealed record PublicStatisticResponse(
    string Label,
    string Value,
    string? Suffix,
    string? Description);
public sealed record StatisticsPresentationResponse(string Phrase, bool IsEnabled);

public sealed record PublicPartnerResponse(
    string Name,
    string Slug,
    string? LogoUrl,
    string? WebsiteUrl,
    string? Description,
    bool IsFeatured);

public sealed record PublicHomepageResponse(
    PublicHomepageContentResponse? Content,
    IReadOnlyList<PublicStatisticResponse> Statistics,
    IReadOnlyList<PublicPartnerResponse> Partners,
    StatisticsPresentationResponse StatisticsPresentation);

public sealed record AdminHomepageContentResponse(
    Guid Id,
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
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    HomepageBuilderResponse Builder);

public sealed record AdminStatisticResponse(
    Guid Id,
    int SlotNumber,
    string Label,
    string Value,
    string? Suffix,
    string? Description,
    int SortOrder,
    bool IsVisible,
    bool IsVerified,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record AdminPartnerResponse(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    string? WebsiteUrl,
    string? Description,
    int SortOrder,
    bool IsVisible,
    bool IsFeatured,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    Guid? LogoMediaAssetId);
