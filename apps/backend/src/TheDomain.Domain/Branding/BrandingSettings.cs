namespace TheDomain.Domain.Branding;

public sealed class BrandingSettings
{
    public static readonly Guid SingletonId = Guid.Parse("00000000-0000-0000-0000-000000000004");
    private BrandingSettings() { }
    public BrandingSettings(Guid id, DateTimeOffset now)
    {
        if (id != SingletonId) throw new ArgumentException("Branding settings must use the singleton identifier.", nameof(id));
        Id = id;
        CreatedAtUtc = UpdatedAtUtc = now;
    }

    public Guid Id { get; private set; }
    public Guid? PrimaryLogoMediaAssetId { get; private set; }
    public Guid? AlternateLogoMediaAssetId { get; private set; }
    public Guid? FaviconMediaAssetId { get; private set; }
    public Guid? SocialImageMediaAssetId { get; private set; }
    public string? PublicEmail { get; private set; }
    public string? PublicPhone { get; private set; }
    public string? WhatsApp { get; private set; }
    public string? PublicAddress { get; private set; }
    public string? InstagramUrl { get; private set; }
    public string? FacebookUrl { get; private set; }
    public string? YouTubeUrl { get; private set; }
    public string? TikTokUrl { get; private set; }
    public string? LinkedInUrl { get; private set; }
    public string? XUrl { get; private set; }
    public string? SnapchatUrl { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Apply(Guid? primaryLogo, Guid? alternateLogo, Guid? favicon, Guid? socialImage,
        string? email, string? phone, string? whatsApp, string? address, string? instagram,
        string? facebook, string? youtube, string? tikTok, string? linkedIn, string? x,
        DateTimeOffset now, string? snapchat = null)
    {
        PrimaryLogoMediaAssetId = primaryLogo;
        AlternateLogoMediaAssetId = alternateLogo;
        FaviconMediaAssetId = favicon;
        SocialImageMediaAssetId = socialImage;
        PublicEmail = Optional(email, 254, nameof(email));
        PublicPhone = Optional(phone, 40, nameof(phone));
        WhatsApp = Optional(whatsApp, 120, nameof(whatsApp));
        PublicAddress = Optional(address, 240, nameof(address));
        InstagramUrl = Optional(instagram, 500, nameof(instagram));
        FacebookUrl = Optional(facebook, 500, nameof(facebook));
        YouTubeUrl = Optional(youtube, 500, nameof(youtube));
        TikTokUrl = Optional(tikTok, 500, nameof(tikTok));
        LinkedInUrl = Optional(linkedIn, 500, nameof(linkedIn));
        XUrl = Optional(x, 500, nameof(x));
        SnapchatUrl = Optional(snapchat, 500, nameof(snapchat));
        UpdatedAtUtc = now;
    }

    private static string? Optional(string? value, int max, string name)
    {
        var result = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        if (result?.Length > max) throw new ArgumentException($"{name} must not exceed {max} characters.", name);
        return result;
    }
}
