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
    bool IsPublished);

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
    bool IsFeatured);
