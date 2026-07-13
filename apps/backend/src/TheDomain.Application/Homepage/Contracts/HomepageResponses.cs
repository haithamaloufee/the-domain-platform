namespace TheDomain.Application.Homepage.Contracts;

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
    string ContactCtaHref);

public sealed record PublicStatisticResponse(
    string Label,
    string Value,
    string? Suffix,
    string? Description);

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
    IReadOnlyList<PublicPartnerResponse> Partners);

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
    DateTimeOffset UpdatedAtUtc);

public sealed record AdminStatisticResponse(
    Guid Id,
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
    DateTimeOffset UpdatedAtUtc);
