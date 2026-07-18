using TheDomain.Application.Caching;
using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;
using TheDomain.Application.Homepage.Contracts;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Homepage;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Homepage;

public sealed class HomepageCmsService(
    IHomepageCmsRepository repository,
    TimeProvider timeProvider,
    IMediaDeliveryUrlResolver? delivery = null,
    IEventService? events = null,
    IGalleryService? gallery = null,
    IPublicOutputCacheInvalidator? cache = null) : IHomepageCmsService
{
    private const int StatisticSlotCount = 4;

    public async Task<PublicHomepageResponse> GetPublicHomepageAsync(CancellationToken token)
    {
        var content = await repository.GetHomepageAsync(token);
        var eventPreview = events is null
            ? new HomepageEventPreviewResponse([], [], [])
            : await events.GetHomepagePreviewAsync(token);
        var statistics = (await repository.ListStatisticsAsync(token))
            .Where(item => item.SlotNumber is >= 1 and <= StatisticSlotCount)
            .OrderBy(item => item.SlotNumber)
            .Select(item => new HomepageStatisticResponse(item.SlotNumber!.Value, item.Value, item.Suffix))
            .ToArray();
        var partners = await GetPublicPartnersAsync(token);
        var builder = content is { IsPublished: true }
            ? await Builder(content, token)
            : EmptyBuilder();
        HomepageGalleryPreviewResponse? galleryPreview = null;
        if (content is { IsPublished: true, GalleryCollectionId: { } collectionId } && gallery is not null
            && await gallery.GetPublicByIdAsync(collectionId, token) is { } collection)
        {
            var media = collection.Media.OrderBy(item => item.SortOrder).ToArray();
            var cover = collection.FeaturedMediaId is { } featured
                ? media.FirstOrDefault(item => item.Id == featured)
                : media.FirstOrDefault();
            galleryPreview = new("collection", new(collection.Id, collection.Title,
                collection.Description, collection.LayoutPreset, media.Length,
                media.Count(item => item.MediaType == MediaType.Image),
                media.Count(item => item.MediaType == MediaType.Video),
                cover is null ? null : Media(cover)), []);
        }
        else if (eventPreview.GalleryAlbums.Count > 0)
        {
            galleryPreview = new("albums", null, eventPreview.GalleryAlbums.Take(3).ToArray());
        }

        return new(new(builder.HeroMedia,
                builder.IsFloatingVideoEnabled && builder.FloatingVideoMedia is { } video
                    ? new(video, builder.FloatingVideoPoster)
                    : null,
                content?.IsStatisticsPhraseEnabled ?? true),
            statistics, eventPreview.CurrentEvents.Take(2).ToArray(),
            eventPreview.PreviousEvents.Take(2).ToArray(), galleryPreview, partners);
    }

    public async Task<IReadOnlyList<PublicStatisticResponse>> GetPublicStatisticsAsync(CancellationToken token) =>
        (await repository.ListStatisticsAsync(token))
            .Where(item => item.SlotNumber is >= 1 and <= StatisticSlotCount)
            .OrderBy(item => item.SlotNumber)
            .Select(item => new PublicStatisticResponse(item.Label, item.Value, item.Suffix, item.Description))
            .ToArray();

    public async Task<IReadOnlyList<PublicPartnerResponse>> GetPublicPartnersAsync(CancellationToken token)
    {
        var partners = (await repository.ListPartnersAsync(token)).Where(item => item.IsVisible)
            .OrderBy(item => item.SortOrder).ThenBy(item => item.Name).ToArray();
        var mediaIds = partners.Where(item => item.LogoMediaAssetId.HasValue)
            .Select(item => item.LogoMediaAssetId!.Value).Distinct().ToArray();
        var media = await repository.ListMediaAsync(mediaIds, token);
        return partners.Select(item => MapPublic(item, media)).ToArray();
    }

    public async Task<AdminHomepageContentResponse?> GetAdminHomepageAsync(CancellationToken token) =>
        await repository.GetHomepageAsync(token) is { } content
            ? new(content.Id, content.IsPublished, content.CreatedAtUtc, content.UpdatedAtUtc,
                await Builder(content, token))
            : null;

    public async Task<CmsOperationResult<AdminHomepageContentResponse>> UpdateHomepageAsync(
        UpdateHomepageContentRequest request, CancellationToken token)
    {
        List<string> errors = [];
        if (request.HeroMediaAssetId is { } heroId && !IsEligibleMedia(await repository.FindMediaAsync(heroId, token), null))
            errors.Add("Hero media must be an approved, non-archived HTTPS image or video.");
        var floatingVideo = await ValidateHomepageMedia(request.FloatingVideoMediaAssetId, MediaType.Video, token);
        if (request.FloatingVideoMediaAssetId.HasValue && floatingVideo is null)
            errors.Add("Floating video must be an approved, non-archived HTTPS video.");
        if (request.IsFloatingVideoEnabled && floatingVideo is null)
            errors.Add("Enable the floating player only after selecting a valid video.");
        var floatingPoster = await ValidateHomepageMedia(request.FloatingVideoPosterMediaAssetId, MediaType.Image, token);
        if (request.FloatingVideoPosterMediaAssetId.HasValue && floatingPoster is null)
            errors.Add("Floating video poster must be an approved, non-archived HTTPS image.");
        if (request.GalleryCollectionId is { } collectionId
            && await repository.FindCollectionAsync(collectionId, token) is not { IsPublishedInGallery: true, IsArchived: false })
            errors.Add("Gallery highlight must use a published, non-archived Collection.");
        if (errors.Count > 0) return Failure<AdminHomepageContentResponse>(CmsFailureKind.Validation, errors);

        var now = timeProvider.GetUtcNow();
        var content = await repository.GetHomepageAsync(token);
        if (content is null)
        {
            content = new(HomepageContent.SingletonId, request.IsPublished, now);
            repository.AddHomepage(content);
        }
        else content.UpdatePublication(request.IsPublished, now);
        content.UpdateBuilder(request.HeroMediaAssetId, request.GalleryCollectionId,
            request.IsFloatingVideoEnabled, request.FloatingVideoMediaAssetId,
            request.FloatingVideoPosterMediaAssetId, now);
        await repository.SaveChangesAsync(token);
        if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.Homepage);
        return CmsOperationResult.Success<AdminHomepageContentResponse>(new(content.Id, content.IsPublished, content.CreatedAtUtc,
            content.UpdatedAtUtc, await Builder(content, token)));
    }

    public async Task<IReadOnlyList<AdminStatisticResponse>> GetAdminStatisticsAsync(CancellationToken token) =>
        (await repository.ListStatisticsAsync(token)).Where(item => item.SlotNumber is >= 1 and <= StatisticSlotCount)
            .OrderBy(item => item.SlotNumber).Select(MapAdmin).ToArray();
    public Task<CmsOperationResult<AdminStatisticResponse>> CreateStatisticAsync(SaveStatisticRequest request, CancellationToken token) =>
        Task.FromResult(CmsOperationResult.Failure<AdminStatisticResponse>(CmsFailureKind.Conflict,
            "The homepage has four permanent statistic slots. Edit an existing slot instead."));
    public async Task<CmsOperationResult<AdminStatisticResponse>> UpdateStatisticAsync(Guid id,
        SaveStatisticRequest request, CancellationToken token)
    {
        var errors = ValidateStatistic(request);
        if (errors.Count > 0) return Failure<AdminStatisticResponse>(CmsFailureKind.Validation, errors);
        var item = await repository.FindStatisticAsync(id, token);
        if (item?.SlotNumber is not (>= 1 and <= StatisticSlotCount))
            return CmsOperationResult.Failure<AdminStatisticResponse>(CmsFailureKind.NotFound, "Statistic slot was not found.");
        item.Update(request.Label.Trim(), request.Value.Trim(), Clean(request.Suffix), Clean(request.Description),
            item.SlotNumber.Value - 1, true, true, timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(token);
        if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.Statistics);
        return CmsOperationResult.Success(MapAdmin(item));
    }
    public Task<CmsOperationResult<AdminStatisticResponse>> SetStatisticVisibilityAsync(Guid id, bool visible, CancellationToken token) =>
        Task.FromResult(CmsOperationResult.Failure<AdminStatisticResponse>(CmsFailureKind.Conflict,
            "Statistic slots are permanent and always visible."));
    public Task<CmsOperationResult<IReadOnlyList<AdminStatisticResponse>>> ReorderStatisticsAsync(ReorderHomepageItemsRequest request, CancellationToken token) =>
        Task.FromResult(CmsOperationResult.Failure<IReadOnlyList<AdminStatisticResponse>>(CmsFailureKind.Conflict,
            "Statistic slot order is fixed."));
    public async Task<StatisticsPresentationResponse> GetStatisticsPresentationAsync(CancellationToken token) =>
        new((await repository.GetHomepageAsync(token))?.IsStatisticsPhraseEnabled ?? true);
    public async Task<CmsOperationResult<StatisticsPresentationResponse>> SaveStatisticsPresentationAsync(
        SaveStatisticsPresentationRequest request, CancellationToken token)
    {
        var item = await repository.GetHomepageAsync(token);
        if (item is null) return CmsOperationResult.Failure<StatisticsPresentationResponse>(CmsFailureKind.Conflict,
            "Create homepage content before configuring its statistics presentation.");
        item.UpdateStatisticsPresentation(request.IsEnabled, timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(token);
        if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.Statistics, PublicCacheTags.Homepage);
        return CmsOperationResult.Success<StatisticsPresentationResponse>(new(request.IsEnabled));
    }

    public async Task<IReadOnlyList<AdminPartnerResponse>> GetAdminPartnersAsync(CancellationToken token) =>
        (await repository.ListPartnersAsync(token)).OrderBy(item => item.SortOrder).ThenBy(item => item.Name)
            .Select(MapAdmin).ToArray();
    public async Task<CmsOperationResult<AdminPartnerResponse>> CreatePartnerAsync(SavePartnerRequest request, CancellationToken token)
    {
        var errors = ValidatePartner(request);
        if (errors.Count > 0) return Failure<AdminPartnerResponse>(CmsFailureKind.Validation, errors);
        if (await repository.PartnerSlugExistsAsync(request.Slug, null, token))
            return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.Conflict, "Partner slug is already in use.");
        var media = await ValidateLogo(request.LogoMediaAssetId, token);
        if (request.LogoMediaAssetId.HasValue && media is null)
            return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.Validation, "Partner logo must be an approved, non-archived HTTPS image.");
        var now = timeProvider.GetUtcNow();
        var item = new Partner(Guid.NewGuid(), request.Name.Trim(), request.Slug.Trim(), media?.Url ?? Clean(request.LogoUrl),
            Clean(request.WebsiteUrl), Clean(request.Description), request.SortOrder, request.IsVisible,
            request.IsFeatured, now, request.LogoMediaAssetId);
        repository.AddPartner(item); await repository.SaveChangesAsync(token);
        await InvalidatePartners(token); return CmsOperationResult.Success(MapAdmin(item));
    }
    public async Task<CmsOperationResult<AdminPartnerResponse>> UpdatePartnerAsync(Guid id, SavePartnerRequest request, CancellationToken token)
    {
        var errors = ValidatePartner(request);
        if (errors.Count > 0) return Failure<AdminPartnerResponse>(CmsFailureKind.Validation, errors);
        var item = await repository.FindPartnerAsync(id, token);
        if (item is null) return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.NotFound, "Partner was not found.");
        if (await repository.PartnerSlugExistsAsync(request.Slug, id, token))
            return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.Conflict, "Partner slug is already in use.");
        var media = await ValidateLogo(request.LogoMediaAssetId, token);
        if (request.LogoMediaAssetId.HasValue && media is null)
            return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.Validation, "Partner logo must be an approved, non-archived HTTPS image.");
        item.Update(request.Name.Trim(), request.Slug.Trim(), media?.Url ?? Clean(request.LogoUrl),
            Clean(request.WebsiteUrl), Clean(request.Description), request.SortOrder, request.IsVisible,
            request.IsFeatured, timeProvider.GetUtcNow(), request.LogoMediaAssetId);
        await repository.SaveChangesAsync(token); await InvalidatePartners(token);
        return CmsOperationResult.Success(MapAdmin(item));
    }
    public async Task<CmsOperationResult<AdminPartnerResponse>> SetPartnerVisibilityAsync(Guid id, bool visible, CancellationToken token)
    {
        var item = await repository.FindPartnerAsync(id, token);
        if (item is null) return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.NotFound, "Partner was not found.");
        if (visible) item.Show(timeProvider.GetUtcNow()); else item.Hide(timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(token); await InvalidatePartners(token);
        return CmsOperationResult.Success(MapAdmin(item));
    }
    public async Task<CmsOperationResult<IReadOnlyList<AdminPartnerResponse>>> ReorderPartnersAsync(ReorderHomepageItemsRequest request, CancellationToken token)
    {
        var items = await repository.ListPartnersAsync(token);
        if (!ValidOrder(request.Ids, items.Select(item => item.Id)))
            return CmsOperationResult.Failure<IReadOnlyList<AdminPartnerResponse>>(CmsFailureKind.Validation,
                "Partner order must contain every partner exactly once.");
        var byId = items.ToDictionary(item => item.Id); var now = timeProvider.GetUtcNow();
        for (var index = 0; index < request.Ids.Count; index++) byId[request.Ids[index]].SetSortOrder(index, now);
        await repository.SaveChangesAsync(token); await InvalidatePartners(token);
        return CmsOperationResult.Success<IReadOnlyList<AdminPartnerResponse>>((await GetAdminPartnersAsync(token)).ToArray());
    }

    private async Task InvalidatePartners(CancellationToken token)
    { if (cache is not null) await cache.EvictAsync(token, PublicCacheTags.Partners); }
    private async Task<MediaAsset?> ValidateLogo(Guid? id, CancellationToken token) => !id.HasValue ? null
        : IsEligibleMedia(await repository.FindMediaAsync(id.Value, token), MediaType.Image)
            ? await repository.FindMediaAsync(id.Value, token) : null;
    private async Task<MediaAsset?> ValidateHomepageMedia(Guid? id, MediaType mediaType, CancellationToken token)
    { if (!id.HasValue) return null; var item = await repository.FindMediaAsync(id.Value, token); return IsEligibleMedia(item, mediaType) ? item : null; }
    private static bool IsEligibleMedia(MediaAsset? item, MediaType? requiredType) =>
        item is { ApprovalStatus: MediaApprovalStatus.Approved, IsArchived: false }
        && (!requiredType.HasValue || item.MediaType == requiredType)
        && item.MediaType is MediaType.Image or MediaType.Video
        && Uri.TryCreate(item.Url, UriKind.Absolute, out var url) && url.Scheme == Uri.UriSchemeHttps;
    private static bool ValidOrder(IReadOnlyList<Guid>? ids, IEnumerable<Guid> expected)
    { if (ids is null) return false; var values = expected.ToArray(); return ids.Count == values.Length && ids.Distinct().Count() == ids.Count && ids.ToHashSet().SetEquals(values); }

    private static List<string> ValidateStatistic(SaveStatisticRequest request)
    {
        List<string> errors = [];
        Required(request.Label, 100, "Statistic label", errors); Required(request.Value, 50, "Statistic value", errors);
        if (!decimal.TryParse(request.Value, System.Globalization.NumberStyles.AllowDecimalPoint |
            System.Globalization.NumberStyles.AllowLeadingSign, System.Globalization.CultureInfo.InvariantCulture, out _))
            errors.Add("Statistic value must contain numeric text only. Put +, K, or % in the suffix field.");
        Optional(request.Suffix, 20, "Statistic suffix", errors); Optional(request.Description, 500, "Statistic description", errors);
        return errors;
    }
    private static List<string> ValidatePartner(SavePartnerRequest request)
    {
        List<string> errors = [];
        Required(request.Name, 150, "Partner name", errors); Required(request.Slug, 160, "Partner slug", errors);
        Optional(request.Description, 500, "Partner description", errors); Optional(request.LogoUrl, 2048, "Partner logo URL", errors);
        Optional(request.WebsiteUrl, 2048, "Partner website URL", errors);
        if (!IsSlug(request.Slug)) errors.Add("Partner slug must contain lowercase letters, numbers, and single hyphens only.");
        if (request.SortOrder < 0) errors.Add("Partner sort order must be non-negative.");
        ValidateAbsoluteUrl(request.LogoUrl, "Partner logo URL", errors); ValidateAbsoluteUrl(request.WebsiteUrl, "Partner website URL", errors);
        return errors;
    }
    private static void Required(string? value, int maximumLength, string name, List<string> errors)
    { if (string.IsNullOrWhiteSpace(value)) errors.Add($"{name} is required."); else if (value.Length > maximumLength) errors.Add($"{name} must not exceed {maximumLength} characters."); }
    private static void Optional(string? value, int maximumLength, string name, List<string> errors)
    { if (value?.Length > maximumLength) errors.Add($"{name} must not exceed {maximumLength} characters."); }
    private static void ValidateAbsoluteUrl(string? value, string name, List<string> errors)
    { if (!string.IsNullOrWhiteSpace(value) && (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))) errors.Add($"{name} must be an absolute HTTP or HTTPS URL."); }
    private static bool IsSlug(string? value) => !string.IsNullOrWhiteSpace(value)
        && value.All(character => char.IsAsciiLetterOrDigit(character) || character == '-')
        && string.Equals(value, value.ToLowerInvariant(), StringComparison.Ordinal)
        && !value.StartsWith('-') && !value.EndsWith('-') && !value.Contains("--", StringComparison.Ordinal);
    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static CmsOperationResult<T> Failure<T>(CmsFailureKind kind, IReadOnlyList<string> errors) => new(default, errors, kind);

    private async Task<HomepageBuilderResponse> Builder(HomepageContent item, CancellationToken token)
    {
        var ids = new[] { item.HeroMediaAssetId, item.FloatingVideoMediaAssetId, item.FloatingVideoPosterMediaAssetId }
            .Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToArray();
        var media = await repository.ListMediaAsync(ids, token);
        HomepageMediaSummaryResponse? Resolve(Guid? id, MediaType? requiredType = null)
        {
            if (id is null || !media.TryGetValue(id.Value, out var value) || !IsEligibleMedia(value, requiredType)) return null;
            var poster = value.MediaType == MediaType.Video
                ? delivery?.ResolveThumbnailUrl(value.MediaType, value.Url, value.ThumbnailUrl, value.CloudinaryPublicId) ?? value.ThumbnailUrl
                : null;
            return new(value.Id, value.MediaType, value.Url, poster, value.AltText);
        }
        return new(item.HeroMediaAssetId, item.GalleryCollectionId, Resolve(item.HeroMediaAssetId),
            item.IsFloatingVideoEnabled, item.FloatingVideoMediaAssetId, item.FloatingVideoPosterMediaAssetId,
            Resolve(item.FloatingVideoMediaAssetId, MediaType.Video), Resolve(item.FloatingVideoPosterMediaAssetId, MediaType.Image));
    }
    private static HomepageBuilderResponse EmptyBuilder() => new(null, null, null, false, null, null, null, null);
    private static HomepageMediaSummaryResponse Media(GalleryPublicMediaResponse media) =>
        new(media.Id, media.MediaType, media.Url, media.PosterUrl, media.AltText);
    private static PublicPartnerResponse MapPublic(Partner item, IReadOnlyDictionary<Guid, MediaAsset> media)
    {
        string? logoUrl = null;
        if (item.LogoMediaAssetId is { } mediaId && media.TryGetValue(mediaId, out var logo) && IsEligibleMedia(logo, MediaType.Image)) logoUrl = logo.Url;
        else if (item.LogoMediaAssetId is null && Uri.TryCreate(item.LogoUrl, UriKind.Absolute, out var legacyLogo) && legacyLogo.Scheme == Uri.UriSchemeHttps) logoUrl = item.LogoUrl;
        return new(item.Name, item.Slug, logoUrl, item.WebsiteUrl, item.Description, item.IsFeatured);
    }
    private static AdminStatisticResponse MapAdmin(StatisticItem item) => new(item.Id,
        item.SlotNumber ?? throw new InvalidOperationException("Homepage statistic is not assigned to a slot."),
        item.Label, item.Value, item.Suffix, item.Description, item.SortOrder, item.IsVisible,
        item.IsVerified, item.CreatedAtUtc, item.UpdatedAtUtc);
    private static AdminPartnerResponse MapAdmin(Partner item) => new(item.Id, item.Name, item.Slug,
        item.LogoUrl, item.WebsiteUrl, item.Description, item.SortOrder, item.IsVisible,
        item.IsFeatured, item.CreatedAtUtc, item.UpdatedAtUtc, item.LogoMediaAssetId);
}
