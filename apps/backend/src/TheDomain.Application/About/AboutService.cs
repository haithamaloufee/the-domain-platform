using TheDomain.Application.Caching;
using TheDomain.Application.Homepage;
using TheDomain.Application.Homepage.Contracts;
using TheDomain.Application.Media;
using TheDomain.Domain.About;
using TheDomain.Domain.Media;

namespace TheDomain.Application.About;

public sealed class AboutService(IAboutRepository repository, TimeProvider timeProvider,
    IMediaDeliveryUrlResolver? delivery = null, IPublicOutputCacheInvalidator? cache = null) : IAboutService
{
    public async Task<AboutSettingsResponse?> GetAdminSettingsAsync(CancellationToken token) =>
        await repository.GetSettingsAsync(token) is { } item ? await MapAdmin(item, token) : null;

    public async Task<CmsOperationResult<AboutSettingsResponse>> SaveSettingsAsync(SaveAboutSettingsRequest request, CancellationToken token)
    {
        List<string> errors = [];
        if (!Enum.IsDefined(request.HeroPresentation)) errors.Add("Hero presentation preset is unsupported.");
        var hero = await EligibleMedia(request.HeroMediaAssetId, true, token);
        if (request.HeroMediaAssetId.HasValue && hero is null) errors.Add("Hero media must be an approved, non-archived HTTPS image or video.");
        var social = await EligibleMedia(request.SocialImageMediaAssetId, false, token);
        if (request.SocialImageMediaAssetId.HasValue && social is null) errors.Add("Social image must be an approved, non-archived HTTPS image.");
        if (errors.Count > 0) return Fail<AboutSettingsResponse>(errors);
        var now = timeProvider.GetUtcNow(); var item = await repository.GetSettingsAsync(token);
        if (item is null) { item = new(now); repository.AddSettings(item); }
        item.Update(request.IsPublished, request.IsHeroEnabled, request.HeroMediaAssetId,
            request.HeroPresentation, request.IsStoryEnabled, request.IsTeamEnabled,
            request.IsPartnersEnabled, request.IsReachOutEnabled, request.SocialImageMediaAssetId, now);
        await repository.SaveChangesAsync(token); await Invalidate(token);
        return CmsOperationResult.Success(await MapAdmin(item, token));
    }

    public async Task<IReadOnlyList<TeamMemberResponse>> ListAdminTeamAsync(CancellationToken token) => await MapTeam(await repository.ListTeamAsync(token), token);
    public async Task<CmsOperationResult<TeamMemberResponse>> CreateTeamMemberAsync(SaveTeamMemberRequest request, CancellationToken token)
    {
        var errors = ValidateTeam(request); var photo = await EligibleMedia(request.PhotoMediaAssetId, false, token);
        if (photo is null) errors.Add("Team photo must be an approved, non-archived HTTPS image.");
        if (errors.Count > 0) return Fail<TeamMemberResponse>(errors);
        var team = await repository.ListTeamAsync(token); var now = timeProvider.GetUtcNow();
        var item = new TeamMember(Guid.NewGuid(), request.Name.Trim(), request.Role.Trim(), Clean(request.Biography),
            request.PhotoMediaAssetId, Clean(request.ProfileUrl), request.IsVisible,
            team.Count == 0 ? 0 : team.Max(value => value.SortOrder) + 1, now);
        repository.AddTeamMember(item); await repository.SaveChangesAsync(token); await Invalidate(token);
        return CmsOperationResult.Success(MapTeam(item, photo!));
    }
    public async Task<CmsOperationResult<TeamMemberResponse>> UpdateTeamMemberAsync(Guid id, SaveTeamMemberRequest request, CancellationToken token)
    {
        var item = await repository.FindTeamMemberAsync(id, token); if (item is null) return Missing<TeamMemberResponse>();
        var errors = ValidateTeam(request); var photo = await EligibleMedia(request.PhotoMediaAssetId, false, token);
        if (photo is null) errors.Add("Team photo must be an approved, non-archived HTTPS image.");
        if (errors.Count > 0) return Fail<TeamMemberResponse>(errors);
        item.Update(request.Name.Trim(), request.Role.Trim(), Clean(request.Biography), request.PhotoMediaAssetId,
            Clean(request.ProfileUrl), request.IsVisible, item.SortOrder, timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(token); await Invalidate(token); return CmsOperationResult.Success(MapTeam(item, photo!));
    }
    public async Task<CmsOperationResult<TeamMemberResponse>> SetTeamVisibilityAsync(Guid id, bool visible, CancellationToken token)
    {
        var item = await repository.FindTeamMemberAsync(id, token); if (item is null) return Missing<TeamMemberResponse>();
        item.SetVisibility(visible, timeProvider.GetUtcNow()); await repository.SaveChangesAsync(token); await Invalidate(token);
        var photo = await repository.FindMediaAsync(item.PhotoMediaAssetId, token); return CmsOperationResult.Success(MapTeam(item, photo!));
    }
    public async Task<CmsOperationResult<IReadOnlyList<TeamMemberResponse>>> ReorderTeamAsync(ReorderTeamRequest request, CancellationToken token)
    {
        var items = await repository.ListTeamAsync(token); var expected = items.Select(item => item.Id).ToHashSet();
        if (request.Ids is null || request.Ids.Count != items.Count || request.Ids.Distinct().Count() != request.Ids.Count || !request.Ids.ToHashSet().SetEquals(expected))
            return Fail<IReadOnlyList<TeamMemberResponse>>(["Team order must contain every Team member exactly once."]);
        var byId = items.ToDictionary(item => item.Id); var now = timeProvider.GetUtcNow();
        for (var i = 0; i < request.Ids.Count; i++) byId[request.Ids[i]].SetSortOrder(i, now);
        await repository.SaveChangesAsync(token); await Invalidate(token);
        return CmsOperationResult.Success<IReadOnlyList<TeamMemberResponse>>(await ListAdminTeamAsync(token));
    }
    public async Task<CmsOperationResult<bool>> DeleteTeamMemberAsync(Guid id, CancellationToken token)
    {
        var item = await repository.FindTeamMemberAsync(id, token); if (item is null) return Missing<bool>();
        repository.RemoveTeamMember(item); await repository.SaveChangesAsync(token); await Invalidate(token);
        return CmsOperationResult.Success(true);
    }

    public async Task<PublicAboutResponse> GetPublicAboutAsync(CancellationToken token)
    {
        var item = await repository.GetSettingsAsync(token);
        var settings = item is { IsPublished: true } ? await MapPublic(item, token) : DefaultPublic();
        IReadOnlyList<PublicTeamMemberResponse> team = settings.IsTeamEnabled ? await MapPublicTeam(token) : [];
        var partners = settings.IsPartnersEnabled
            ? (await repository.ListPartnersAsync(token)).Where(value => value.IsVisible).OrderBy(value => value.SortOrder)
                .Select(value => new PublicPartnerResponse(value.Name, value.Slug, value.LogoUrl,
                    SafePublic(value.WebsiteUrl), value.Description, value.IsFeatured)).ToArray()
            : [];
        return new(settings, team, partners);
    }

    private async Task<MediaAsset?> EligibleMedia(Guid? id, bool allowVideo, CancellationToken token)
    { if (!id.HasValue) return null; var media = await repository.FindMediaAsync(id.Value, token); return Eligible(media, allowVideo) ? media : null; }
    private static bool Eligible(MediaAsset? media, bool allowVideo) => media is { IsArchived: false, ApprovalStatus: MediaApprovalStatus.Approved }
        && (media.MediaType == MediaType.Image || allowVideo && media.MediaType == MediaType.Video) && IsHttps(media.Url);
    private static List<string> ValidateTeam(SaveTeamMemberRequest request)
    {
        List<string> errors = []; Required(request.Name, 150, "Team member name", errors);
        Required(request.Role, 150, "Team member role", errors); Optional(request.Biography, 700, "Team member biography", errors);
        if (!string.IsNullOrWhiteSpace(request.ProfileUrl) && !IsHttps(request.ProfileUrl)) errors.Add("Profile link must be an HTTPS URL.");
        return errors;
    }
    private async Task<AboutSettingsResponse> MapAdmin(AboutSettings item, CancellationToken token) =>
        new(item.Id, item.IsPublished, item.IsHeroEnabled, item.HeroMediaAssetId,
            await Media(item.HeroMediaAssetId, token), item.HeroPresentation, item.IsStoryEnabled,
            item.IsTeamEnabled, item.IsPartnersEnabled, item.IsReachOutEnabled,
            item.SocialImageMediaAssetId, await Media(item.SocialImageMediaAssetId, token), item.CreatedAtUtc, item.UpdatedAtUtc);
    private async Task<PublicAboutSettingsResponse> MapPublic(AboutSettings item, CancellationToken token) =>
        new(item.IsHeroEnabled, await Media(item.HeroMediaAssetId, token), item.HeroPresentation,
            item.IsStoryEnabled, item.IsTeamEnabled, item.IsPartnersEnabled, item.IsReachOutEnabled,
            (await Media(item.SocialImageMediaAssetId, token))?.Url);
    private static PublicAboutSettingsResponse DefaultPublic() =>
        new(true, null, AboutHeroPresentation.EditorialSplit, true, true, true, true, null);
    private async Task<AboutMediaResponse?> Media(Guid? id, CancellationToken token)
    {
        var media = id.HasValue ? await repository.FindMediaAsync(id.Value, token) : null;
        return !Eligible(media, true) ? null : new(media!.Id, media.MediaType, media.Url,
            media.MediaType == MediaType.Video ? delivery?.ResolveThumbnailUrl(media.MediaType, media.Url,
                media.ThumbnailUrl, media.CloudinaryPublicId) ?? media.ThumbnailUrl : null, media.AltText);
    }
    private async Task<IReadOnlyList<PublicTeamMemberResponse>> MapPublicTeam(CancellationToken token)
    {
        var team = (await repository.ListTeamAsync(token)).Where(value => value.IsVisible).OrderBy(value => value.SortOrder).ToArray();
        var media = await repository.ListMediaAsync(team.Select(item => item.PhotoMediaAssetId).Distinct().ToArray(), token);
        return team.Where(item => media.TryGetValue(item.PhotoMediaAssetId, out var photo) && Eligible(photo, false))
            .Select(item => { var photo = media[item.PhotoMediaAssetId]; return new PublicTeamMemberResponse(item.Id,
                item.Name, item.Role, item.Biography, photo.Url, photo.AltText, SafePublic(item.ProfileUrl)); }).ToArray();
    }
    private async Task<IReadOnlyList<TeamMemberResponse>> MapTeam(IReadOnlyList<TeamMember> values, CancellationToken token)
    {
        var media = await repository.ListMediaAsync(values.Select(item => item.PhotoMediaAssetId).Distinct().ToArray(), token);
        return values.OrderBy(value => value.SortOrder).ThenBy(value => value.Name)
            .Where(item => media.ContainsKey(item.PhotoMediaAssetId)).Select(item => MapTeam(item, media[item.PhotoMediaAssetId])).ToArray();
    }
    private static TeamMemberResponse MapTeam(TeamMember item, MediaAsset photo) => new(item.Id, item.Name,
        item.Role, item.Biography, item.PhotoMediaAssetId, photo.Url, photo.AltText, item.ProfileUrl,
        item.IsVisible, item.SortOrder, item.CreatedAtUtc, item.UpdatedAtUtc);
    private async Task Invalidate(CancellationToken token) { if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.About); }
    private static void Required(string? value, int max, string name, List<string> errors)
    { if (string.IsNullOrWhiteSpace(value)) errors.Add($"{name} is required."); else if (value.Trim().Length > max) errors.Add($"{name} must not exceed {max} characters."); }
    private static void Optional(string? value, int max, string name, List<string> errors)
    { if (value?.Trim().Length > max) errors.Add($"{name} must not exceed {max} characters."); }
    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static bool IsHttps(string? value) => Uri.TryCreate(value, UriKind.Absolute, out var url) && url.Scheme == Uri.UriSchemeHttps;
    private static string? SafePublic(string? value) => string.IsNullOrWhiteSpace(value) || !IsHttps(value) ? null : value;
    private static CmsOperationResult<T> Fail<T>(IReadOnlyList<string> errors) => new(default, errors, CmsFailureKind.Validation);
    private static CmsOperationResult<T> Missing<T>() => CmsOperationResult.Failure<T>(CmsFailureKind.NotFound, "Team member was not found.");
}
