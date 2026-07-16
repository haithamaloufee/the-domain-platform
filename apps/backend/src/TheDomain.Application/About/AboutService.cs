using TheDomain.Application.Homepage;
using TheDomain.Application.Homepage.Contracts;
using TheDomain.Application.Media;
using TheDomain.Domain.About;
using TheDomain.Domain.Media;

namespace TheDomain.Application.About;

public sealed class AboutService(IAboutRepository repository, TimeProvider timeProvider,
    IMediaDeliveryUrlResolver? delivery = null) : IAboutService
{
    public async Task<AboutSettingsResponse?> GetAdminSettingsAsync(CancellationToken token) =>
        await repository.GetSettingsAsync(token) is { } item ? await MapAdmin(item, token) : null;

    public async Task<CmsOperationResult<AboutSettingsResponse>> SaveSettingsAsync(SaveAboutSettingsRequest request, CancellationToken token)
    {
        var errors = ValidateSettings(request);
        var hero = await EligibleMedia(request.HeroMediaAssetId, allowVideo: true, token);
        if (request.HeroMediaAssetId.HasValue && hero is null) errors.Add("Hero media must be an approved, non-archived HTTPS image or video.");
        var social = await EligibleMedia(request.SocialImageMediaAssetId, allowVideo: false, token);
        if (request.SocialImageMediaAssetId.HasValue && social is null) errors.Add("Social image must be an approved, non-archived HTTPS image.");
        if (errors.Count > 0) return Fail<AboutSettingsResponse>(errors);
        var now = timeProvider.GetUtcNow(); var item = await repository.GetSettingsAsync(token);
        if (item is null) { item = new(now); repository.AddSettings(item); }
        item.Update(request.IsPublished, request.IsHeroEnabled, request.HeroEyebrow.Trim(), request.HeroHeading.Trim(),
            request.HeroText.Trim(), request.HeroMediaAssetId, request.HeroPresentation, request.IntroStatement.Trim(),
            request.IsStoryEnabled, request.StoryHeading.Trim(), request.StoryText.Trim(), Clean(request.StoryHighlight),
            request.IsTeamEnabled, request.TeamHeading.Trim(), request.TeamText.Trim(), request.IsPartnersEnabled,
            request.PartnersHeading.Trim(), request.PartnersText.Trim(), request.IsReachOutEnabled,
            request.ReachOutHeading.Trim(), request.ReachOutText.Trim(), request.ReachOutCtaLabel.Trim(),
            request.ReachOutCtaHref.Trim(), Clean(request.SeoTitle), Clean(request.SeoDescription),
            request.SocialImageMediaAssetId, now);
        await repository.SaveChangesAsync(token); return CmsOperationResult.Success(await MapAdmin(item, token));
    }

    public async Task<IReadOnlyList<TeamMemberResponse>> ListAdminTeamAsync(CancellationToken token) =>
        await MapTeam(await repository.ListTeamAsync(token), token);

    public async Task<CmsOperationResult<TeamMemberResponse>> CreateTeamMemberAsync(SaveTeamMemberRequest request, CancellationToken token)
    {
        var errors = ValidateTeam(request); var photo = await EligibleMedia(request.PhotoMediaAssetId, false, token);
        if (photo is null) errors.Add("Team photo must be an approved, non-archived HTTPS image.");
        if (errors.Count > 0) return Fail<TeamMemberResponse>(errors);
        var team = await repository.ListTeamAsync(token); var now = timeProvider.GetUtcNow();
        var item = new TeamMember(Guid.NewGuid(), request.Name.Trim(), request.Role.Trim(), Clean(request.Biography),
            request.PhotoMediaAssetId, Clean(request.ProfileUrl), request.IsVisible,
            team.Count == 0 ? 0 : team.Max(value => value.SortOrder) + 1, now);
        repository.AddTeamMember(item); await repository.SaveChangesAsync(token); return CmsOperationResult.Success(MapTeam(item, photo!));
    }

    public async Task<CmsOperationResult<TeamMemberResponse>> UpdateTeamMemberAsync(Guid id, SaveTeamMemberRequest request, CancellationToken token)
    {
        var item = await repository.FindTeamMemberAsync(id, token); if (item is null) return Missing<TeamMemberResponse>();
        var errors = ValidateTeam(request); var photo = await EligibleMedia(request.PhotoMediaAssetId, false, token);
        if (photo is null) errors.Add("Team photo must be an approved, non-archived HTTPS image.");
        if (errors.Count > 0) return Fail<TeamMemberResponse>(errors);
        item.Update(request.Name.Trim(), request.Role.Trim(), Clean(request.Biography), request.PhotoMediaAssetId,
            Clean(request.ProfileUrl), request.IsVisible, item.SortOrder, timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(token); return CmsOperationResult.Success(MapTeam(item, photo!));
    }

    public async Task<CmsOperationResult<TeamMemberResponse>> SetTeamVisibilityAsync(Guid id, bool visible, CancellationToken token)
    {
        var item = await repository.FindTeamMemberAsync(id, token); if (item is null) return Missing<TeamMemberResponse>();
        item.SetVisibility(visible, timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token);
        var photo = await repository.FindMediaAsync(item.PhotoMediaAssetId, token); return CmsOperationResult.Success(MapTeam(item, photo!));
    }

    public async Task<CmsOperationResult<IReadOnlyList<TeamMemberResponse>>> ReorderTeamAsync(ReorderTeamRequest request, CancellationToken token)
    {
        var items = await repository.ListTeamAsync(token); var expected = items.Select(item => item.Id).ToHashSet();
        if (request.Ids is null || request.Ids.Count != items.Count || request.Ids.Distinct().Count() != request.Ids.Count || !request.Ids.ToHashSet().SetEquals(expected))
            return Fail<IReadOnlyList<TeamMemberResponse>>(["Team order must contain every Team member exactly once."]);
        var byId = items.ToDictionary(item => item.Id); var now = timeProvider.GetUtcNow();
        for (var i = 0; i < request.Ids.Count; i++) byId[request.Ids[i]].SetSortOrder(i, now);
        await repository.SaveChangesAsync(token); return CmsOperationResult.Success<IReadOnlyList<TeamMemberResponse>>(await ListAdminTeamAsync(token));
    }

    public async Task<CmsOperationResult<bool>> DeleteTeamMemberAsync(Guid id, CancellationToken token)
    { var item = await repository.FindTeamMemberAsync(id, token); if (item is null) return Missing<bool>(); repository.RemoveTeamMember(item); await repository.SaveChangesAsync(token); return CmsOperationResult.Success(true); }

    public async Task<PublicAboutResponse> GetPublicAboutAsync(CancellationToken token)
    {
        var item = await repository.GetSettingsAsync(token); var settings = item is { IsPublished: true }
            ? await MapPublic(item, token) : await DefaultPublic(token);
        IReadOnlyList<PublicTeamMemberResponse> team = settings.IsTeamEnabled ? await MapPublicTeam(token) : [];
        var partners = settings.IsPartnersEnabled ? (await repository.ListPartnersAsync(token)).Where(value => value.IsVisible).OrderBy(value => value.SortOrder)
            .Select(value => new PublicPartnerResponse(value.Name, value.Slug, value.LogoUrl, SafePublic(value.WebsiteUrl), value.Description, value.IsFeatured)).ToArray() : [];
        return new(settings, team, partners);
    }

    private async Task<MediaAsset?> EligibleMedia(Guid? id, bool allowVideo, CancellationToken token)
    { if (!id.HasValue) return null; var media = await repository.FindMediaAsync(id.Value, token); return media is { IsArchived: false, ApprovalStatus: MediaApprovalStatus.Approved } && (media.MediaType == MediaType.Image || allowVideo && media.MediaType == MediaType.Video) && IsHttps(media.Url) ? media : null; }
    private static List<string> ValidateSettings(SaveAboutSettingsRequest request)
    { List<string> errors = []; Required(request.HeroEyebrow, 100, "Hero eyebrow", errors); Required(request.HeroHeading, 200, "Hero heading", errors); Required(request.HeroText, 700, "Hero text", errors); Required(request.IntroStatement, 700, "Intro statement", errors); Required(request.StoryHeading, 200, "Story heading", errors); Required(request.StoryText, 2500, "Story text", errors); Optional(request.StoryHighlight, 300, "Story highlight", errors); Required(request.TeamHeading, 200, "Team heading", errors); Required(request.TeamText, 700, "Team text", errors); Required(request.PartnersHeading, 200, "Partners heading", errors); Required(request.PartnersText, 700, "Partners text", errors); Required(request.ReachOutHeading, 200, "Reach Out heading", errors); Required(request.ReachOutText, 700, "Reach Out text", errors); Required(request.ReachOutCtaLabel, 100, "Reach Out CTA label", errors); Optional(request.SeoTitle, 70, "SEO title", errors); Optional(request.SeoDescription, 180, "SEO description", errors); if (!Enum.IsDefined(request.HeroPresentation)) errors.Add("Hero presentation preset is unsupported."); if (!SafeHref(request.ReachOutCtaHref)) errors.Add("Reach Out CTA must be a safe internal, HTTPS, mail, telephone, or WhatsApp destination."); return errors; }
    private static List<string> ValidateTeam(SaveTeamMemberRequest request)
    { List<string> errors = []; Required(request.Name, 150, "Team member name", errors); Required(request.Role, 150, "Team member role", errors); Optional(request.Biography, 700, "Team member biography", errors); if (!string.IsNullOrWhiteSpace(request.ProfileUrl) && !IsHttps(request.ProfileUrl)) errors.Add("Profile link must be an HTTPS URL."); return errors; }
    private async Task<AboutSettingsResponse> MapAdmin(AboutSettings item, CancellationToken token) => new(item.Id, item.IsPublished, item.IsHeroEnabled, item.HeroEyebrow, item.HeroHeading, item.HeroText, item.HeroMediaAssetId, await Media(item.HeroMediaAssetId, token), item.HeroPresentation, item.IntroStatement, item.IsStoryEnabled, item.StoryHeading, item.StoryText, item.StoryHighlight, item.IsTeamEnabled, item.TeamHeading, item.TeamText, item.IsPartnersEnabled, item.PartnersHeading, item.PartnersText, item.IsReachOutEnabled, item.ReachOutHeading, item.ReachOutText, item.ReachOutCtaLabel, item.ReachOutCtaHref, item.SeoTitle, item.SeoDescription, item.SocialImageMediaAssetId, await Media(item.SocialImageMediaAssetId, token), item.CreatedAtUtc, item.UpdatedAtUtc);
    private async Task<PublicAboutSettingsResponse> MapPublic(AboutSettings item, CancellationToken token) => new(item.IsHeroEnabled, item.HeroEyebrow, item.HeroHeading, item.HeroText, await Media(item.HeroMediaAssetId, token), item.HeroPresentation, item.IntroStatement, item.IsStoryEnabled, item.StoryHeading, item.StoryText, item.StoryHighlight, item.IsTeamEnabled, item.TeamHeading, item.TeamText, item.IsPartnersEnabled, item.PartnersHeading, item.PartnersText, item.IsReachOutEnabled, item.ReachOutHeading, item.ReachOutText, item.ReachOutCtaLabel, item.ReachOutCtaHref, item.SeoTitle, item.SeoDescription, (await Media(item.SocialImageMediaAssetId, token))?.Url);
    private async Task<PublicAboutSettingsResponse> DefaultPublic(CancellationToken token) { var value = new AboutSettings(timeProvider.GetUtcNow()); return await MapPublic(value, token); }
    private async Task<AboutMediaResponse?> Media(Guid? id, CancellationToken token) { var media = id.HasValue ? await repository.FindMediaAsync(id.Value, token) : null; return media is not { IsArchived: false, ApprovalStatus: MediaApprovalStatus.Approved } || !IsHttps(media.Url) ? null : new(media.Id, media.MediaType, media.Url, media.MediaType == MediaType.Video ? delivery?.ResolveThumbnailUrl(media.MediaType, media.Url, media.ThumbnailUrl, media.CloudinaryPublicId) ?? media.ThumbnailUrl : null, media.AltText); }
    private async Task<IReadOnlyList<PublicTeamMemberResponse>> MapPublicTeam(CancellationToken token) { var result = new List<PublicTeamMemberResponse>(); foreach (var item in (await repository.ListTeamAsync(token)).Where(value => value.IsVisible).OrderBy(value => value.SortOrder)) { if (await EligibleMedia(item.PhotoMediaAssetId, false, token) is { } photo) result.Add(new(item.Id, item.Name, item.Role, item.Biography, photo.Url, photo.AltText, SafePublic(item.ProfileUrl))); } return result; }
    private async Task<IReadOnlyList<TeamMemberResponse>> MapTeam(IReadOnlyList<TeamMember> values, CancellationToken token) { var result = new List<TeamMemberResponse>(); foreach (var item in values.OrderBy(value => value.SortOrder).ThenBy(value => value.Name)) { var photo = await repository.FindMediaAsync(item.PhotoMediaAssetId, token); if (photo is not null) result.Add(MapTeam(item, photo)); } return result; }
    private static TeamMemberResponse MapTeam(TeamMember item, MediaAsset photo) => new(item.Id, item.Name, item.Role, item.Biography, item.PhotoMediaAssetId, photo.Url, photo.AltText, item.ProfileUrl, item.IsVisible, item.SortOrder, item.CreatedAtUtc, item.UpdatedAtUtc);
    private static void Required(string? value, int max, string name, List<string> errors) { if (string.IsNullOrWhiteSpace(value)) errors.Add($"{name} is required."); else if (value.Trim().Length > max) errors.Add($"{name} must not exceed {max} characters."); }
    private static void Optional(string? value, int max, string name, List<string> errors) { if (value?.Trim().Length > max) errors.Add($"{name} must not exceed {max} characters."); }
    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static bool IsHttps(string? value) => Uri.TryCreate(value, UriKind.Absolute, out var url) && url.Scheme == Uri.UriSchemeHttps;
    private static bool SafeHref(string? value) { if (string.IsNullOrWhiteSpace(value)) return false; if (value.StartsWith('/') && !value.StartsWith("//", StringComparison.Ordinal)) return true; return Uri.TryCreate(value, UriKind.Absolute, out var url) && (url.Scheme == Uri.UriSchemeHttps || url.Scheme is "mailto" or "tel"); }
    private static string? SafePublic(string? value) => string.IsNullOrWhiteSpace(value) || !(IsHttps(value) || SafeHref(value)) ? null : value;
    private static CmsOperationResult<T> Fail<T>(IReadOnlyList<string> errors) => new(default, errors, CmsFailureKind.Validation);
    private static CmsOperationResult<T> Missing<T>() => CmsOperationResult.Failure<T>(CmsFailureKind.NotFound, "Team member was not found.");
}
