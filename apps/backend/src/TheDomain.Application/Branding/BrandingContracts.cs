namespace TheDomain.Application.Branding;

public sealed record BrandingMediaResponse(Guid Id, string Url, string? AltText,
    int? Width, int? Height);
public sealed record BrandingSettingsResponse(Guid? PrimaryLogoMediaAssetId,
    Guid? AlternateLogoMediaAssetId, Guid? FaviconMediaAssetId, Guid? SocialImageMediaAssetId,
    BrandingMediaResponse? PrimaryLogo, BrandingMediaResponse? AlternateLogo,
    BrandingMediaResponse? Favicon, BrandingMediaResponse? SocialImage, string? PublicEmail,
    string? PublicPhone, string? WhatsApp, string? PublicAddress,
    IReadOnlyDictionary<string, string> SocialLinks);
public sealed record PublicBrandingSettingsResponse(BrandingMediaResponse? PrimaryLogo,
    BrandingMediaResponse? AlternateLogo, BrandingMediaResponse? Favicon,
    BrandingMediaResponse? SocialImage, string? PublicEmail, string? PublicPhone,
    string? WhatsApp, string? PublicAddress, IReadOnlyDictionary<string, string> SocialLinks);
public sealed record UpdateBrandingSettingsRequest(Guid? PrimaryLogoMediaAssetId,
    Guid? AlternateLogoMediaAssetId, Guid? FaviconMediaAssetId, Guid? SocialImageMediaAssetId,
    string? PublicEmail, string? PublicPhone, string? WhatsApp, string? PublicAddress,
    IReadOnlyDictionary<string, string?>? SocialLinks);
