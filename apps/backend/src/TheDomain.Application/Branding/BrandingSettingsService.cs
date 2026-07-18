using System.Net.Mail;
using TheDomain.Application.Caching;
using TheDomain.Application.Events;
using TheDomain.Domain.Branding;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Branding;

public sealed class BrandingSettingsService(IBrandingSettingsRepository repository,
    TimeProvider timeProvider, IPublicOutputCacheInvalidator? cache = null) : IBrandingSettingsService
{
    private static readonly string[] Platforms = ["instagram", "facebook", "youtube", "tiktok", "linkedin", "x", "snapchat"];

    public async Task<BrandingSettingsResponse> GetAdminAsync(CancellationToken token) =>
        await MapAdmin(await repository.GetAsync(false, token), token);

    public async Task<PublicBrandingSettingsResponse> GetPublicAsync(CancellationToken token)
    {
        var admin = await MapAdmin(await repository.GetAsync(false, token), token);
        return new(admin.PrimaryLogo, admin.AlternateLogo ?? admin.PrimaryLogo, admin.Favicon,
            admin.SocialImage, admin.PublicEmail, admin.PublicPhone, admin.WhatsApp,
            admin.PublicAddress, admin.SocialLinks);
    }

    public async Task<EventOperationResult<BrandingSettingsResponse>> UpdateAsync(
        UpdateBrandingSettingsRequest request, CancellationToken token)
    {
        var errors = Validate(request);
        if (errors.Count > 0) return EventOperationResult.Failure<BrandingSettingsResponse>(errors.ToArray());
        var requestedIds = new[] { request.PrimaryLogoMediaAssetId, request.AlternateLogoMediaAssetId,
                request.FaviconMediaAssetId, request.SocialImageMediaAssetId }
            .Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToArray();
        var requestedMedia = await repository.ListMediaAsync(requestedIds, token);
        foreach (var id in requestedIds)
        {
            if (!requestedMedia.TryGetValue(id, out var media)) return EventOperationResult.NotFound<BrandingSettingsResponse>("A selected branding image was not found.");
            if (media.MediaType != MediaType.Image || media.IsArchived
                || media.ApprovalStatus != MediaApprovalStatus.Approved || !SafeHttps(media.Url))
                return EventOperationResult.Conflict<BrandingSettingsResponse>("Active branding assets must be approved, non-archived HTTPS images.");
        }
        var links = NormalizeLinks(request.SocialLinks); var now = timeProvider.GetUtcNow();
        var item = await repository.GetAsync(true, token);
        if (item is null) { item = new BrandingSettings(BrandingSettings.SingletonId, now); repository.Add(item); }
        item.Apply(request.PrimaryLogoMediaAssetId, request.AlternateLogoMediaAssetId,
            request.FaviconMediaAssetId, request.SocialImageMediaAssetId, request.PublicEmail,
            request.PublicPhone, request.WhatsApp, request.PublicAddress,
            links.GetValueOrDefault("instagram"), links.GetValueOrDefault("facebook"),
            links.GetValueOrDefault("youtube"), links.GetValueOrDefault("tiktok"),
            links.GetValueOrDefault("linkedin"), links.GetValueOrDefault("x"), now,
            links.GetValueOrDefault("snapchat"));
        await repository.SaveChangesAsync(token);
        if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.Branding);
        return EventOperationResult.Success(await MapAdmin(item, token));
    }

    private async Task<BrandingSettingsResponse> MapAdmin(BrandingSettings? item, CancellationToken token)
    {
        if (item is null) return new(null, null, null, null, null, null, null, null,
            null, null, null, null, new Dictionary<string, string>());
        var ids = new[] { item.PrimaryLogoMediaAssetId, item.AlternateLogoMediaAssetId,
                item.FaviconMediaAssetId, item.SocialImageMediaAssetId }
            .Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToArray();
        var media = await repository.ListMediaAsync(ids, token);
        BrandingMediaResponse? Media(Guid? id)
        {
            if (id is null || !media.TryGetValue(id.Value, out var value)) return null;
            return value is { MediaType: MediaType.Image, IsArchived: false,
                    ApprovalStatus: MediaApprovalStatus.Approved } && SafeHttps(value.Url)
                ? new(value.Id, value.Url, value.AltText, value.Width, value.Height) : null;
        }
        return new(item.PrimaryLogoMediaAssetId, item.AlternateLogoMediaAssetId,
            item.FaviconMediaAssetId, item.SocialImageMediaAssetId,
            Media(item.PrimaryLogoMediaAssetId), Media(item.AlternateLogoMediaAssetId),
            Media(item.FaviconMediaAssetId), Media(item.SocialImageMediaAssetId),
            item.PublicEmail, item.PublicPhone, item.WhatsApp, item.PublicAddress, Links(item));
    }

    private static List<string> Validate(UpdateBrandingSettingsRequest request)
    {
        List<string> errors = [];
        if (!string.IsNullOrWhiteSpace(request.PublicEmail)) try { _ = new MailAddress(request.PublicEmail.Trim()); } catch (FormatException) { errors.Add("Enter a valid public email address."); }
        if (!string.IsNullOrWhiteSpace(request.PublicPhone) && !ValidPhone(request.PublicPhone)) errors.Add("Enter a valid public phone number.");
        if (!string.IsNullOrWhiteSpace(request.WhatsApp) && !(ValidPhone(request.WhatsApp) || SafeHttps(request.WhatsApp))) errors.Add("Enter a valid WhatsApp number or HTTPS link.");
        foreach (var pair in request.SocialLinks ?? new Dictionary<string, string?>())
            if (!Platforms.Contains(pair.Key, StringComparer.OrdinalIgnoreCase)) errors.Add("An unsupported social platform was provided.");
            else if (!string.IsNullOrWhiteSpace(pair.Value) && !SafeHttps(pair.Value)) errors.Add($"{pair.Key} must use an HTTPS URL.");
        return errors;
    }
    private static Dictionary<string, string> NormalizeLinks(IReadOnlyDictionary<string, string?>? links) =>
        (links ?? new Dictionary<string, string?>()).Where(pair => Platforms.Contains(pair.Key, StringComparer.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(pair.Value)).ToDictionary(pair => pair.Key.ToLowerInvariant(), pair => pair.Value!.Trim());
    private static Dictionary<string, string> Links(BrandingSettings item) => new[] {
        ("instagram", item.InstagramUrl), ("facebook", item.FacebookUrl), ("youtube", item.YouTubeUrl),
        ("tiktok", item.TikTokUrl), ("linkedin", item.LinkedInUrl), ("x", item.XUrl), ("snapchat", item.SnapchatUrl)
    }.Where(value => value.Item2 is not null).ToDictionary(value => value.Item1, value => value.Item2!);
    private static bool SafeHttps(string value) => Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps;
    private static bool ValidPhone(string value) => value.Trim().All(character => char.IsDigit(character) || character is '+' or ' ' or '-' or '(' or ')') && value.Count(char.IsDigit) is >= 7 and <= 20;
}
