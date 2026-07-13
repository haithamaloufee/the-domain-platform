using TheDomain.Application.Homepage.Contracts;
using TheDomain.Domain.Homepage;

namespace TheDomain.Application.Homepage;

public sealed class HomepageCmsService(IHomepageCmsRepository repository, TimeProvider timeProvider)
    : IHomepageCmsService
{
    public async Task<PublicHomepageResponse> GetPublicHomepageAsync(CancellationToken cancellationToken)
    {
        var content = await repository.GetHomepageAsync(cancellationToken);
        var statistics = await GetPublicStatisticsAsync(cancellationToken);
        var partners = await GetPublicPartnersAsync(cancellationToken);
        return new(content is { IsPublished: true } ? MapPublic(content) : null, statistics, partners);
    }

    public async Task<IReadOnlyList<PublicStatisticResponse>> GetPublicStatisticsAsync(CancellationToken cancellationToken) =>
        (await repository.ListStatisticsAsync(cancellationToken))
            .Where(item => item.IsVisible && item.IsVerified)
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Label)
            .Select(MapPublic)
            .ToArray();

    public async Task<IReadOnlyList<PublicPartnerResponse>> GetPublicPartnersAsync(CancellationToken cancellationToken) =>
        (await repository.ListPartnersAsync(cancellationToken))
            .Where(item => item.IsVisible)
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Name)
            .Select(MapPublic)
            .ToArray();

    public async Task<AdminHomepageContentResponse?> GetAdminHomepageAsync(CancellationToken cancellationToken) =>
        await repository.GetHomepageAsync(cancellationToken) is { } content ? MapAdmin(content) : null;

    public async Task<CmsOperationResult<AdminHomepageContentResponse>> UpdateHomepageAsync(
        UpdateHomepageContentRequest request, CancellationToken cancellationToken)
    {
        var errors = ValidateHomepage(request);
        if (errors.Count > 0) return Failure<AdminHomepageContentResponse>(CmsFailureKind.Validation, errors);

        var now = timeProvider.GetUtcNow();
        var content = await repository.GetHomepageAsync(cancellationToken);
        if (content is null)
        {
            content = CreateHomepage(request, now);
            repository.AddHomepage(content);
        }
        else
        {
            Apply(content, request, now);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(content));
    }

    public async Task<IReadOnlyList<AdminStatisticResponse>> GetAdminStatisticsAsync(CancellationToken cancellationToken) =>
        (await repository.ListStatisticsAsync(cancellationToken))
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Label)
            .Select(MapAdmin)
            .ToArray();

    public async Task<CmsOperationResult<AdminStatisticResponse>> CreateStatisticAsync(
        SaveStatisticRequest request, CancellationToken cancellationToken)
    {
        var errors = ValidateStatistic(request);
        if (errors.Count > 0) return Failure<AdminStatisticResponse>(CmsFailureKind.Validation, errors);
        var now = timeProvider.GetUtcNow();
        var item = new StatisticItem(Guid.NewGuid(), request.Label.Trim(), request.Value.Trim(),
            Clean(request.Suffix), Clean(request.Description), request.SortOrder, request.IsVisible,
            request.IsVerified, now);
        repository.AddStatistic(item);
        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(item));
    }

    public async Task<CmsOperationResult<AdminStatisticResponse>> UpdateStatisticAsync(
        Guid id, SaveStatisticRequest request, CancellationToken cancellationToken)
    {
        var errors = ValidateStatistic(request);
        if (errors.Count > 0) return Failure<AdminStatisticResponse>(CmsFailureKind.Validation, errors);
        var item = await repository.FindStatisticAsync(id, cancellationToken);
        if (item is null) return CmsOperationResult.Failure<AdminStatisticResponse>(CmsFailureKind.NotFound, "Statistic was not found.");
        item.Update(request.Label.Trim(), request.Value.Trim(), Clean(request.Suffix),
            Clean(request.Description), request.SortOrder, request.IsVisible, request.IsVerified,
            timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(item));
    }

    public async Task<CmsOperationResult<AdminStatisticResponse>> SetStatisticVisibilityAsync(
        Guid id, bool visible, CancellationToken cancellationToken)
    {
        var item = await repository.FindStatisticAsync(id, cancellationToken);
        if (item is null) return CmsOperationResult.Failure<AdminStatisticResponse>(CmsFailureKind.NotFound, "Statistic was not found.");
        if (visible) item.Show(timeProvider.GetUtcNow()); else item.Hide(timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(item));
    }

    public async Task<IReadOnlyList<AdminPartnerResponse>> GetAdminPartnersAsync(CancellationToken cancellationToken) =>
        (await repository.ListPartnersAsync(cancellationToken))
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Name)
            .Select(MapAdmin)
            .ToArray();

    public async Task<CmsOperationResult<AdminPartnerResponse>> CreatePartnerAsync(
        SavePartnerRequest request, CancellationToken cancellationToken)
    {
        var errors = ValidatePartner(request);
        if (errors.Count > 0) return Failure<AdminPartnerResponse>(CmsFailureKind.Validation, errors);
        if (await repository.PartnerSlugExistsAsync(request.Slug, null, cancellationToken))
            return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.Conflict, "Partner slug is already in use.");
        var now = timeProvider.GetUtcNow();
        var item = new Partner(Guid.NewGuid(), request.Name.Trim(), request.Slug.Trim(),
            Clean(request.LogoUrl), Clean(request.WebsiteUrl), Clean(request.Description),
            request.SortOrder, request.IsVisible, request.IsFeatured, now);
        repository.AddPartner(item);
        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(item));
    }

    public async Task<CmsOperationResult<AdminPartnerResponse>> UpdatePartnerAsync(
        Guid id, SavePartnerRequest request, CancellationToken cancellationToken)
    {
        var errors = ValidatePartner(request);
        if (errors.Count > 0) return Failure<AdminPartnerResponse>(CmsFailureKind.Validation, errors);
        var item = await repository.FindPartnerAsync(id, cancellationToken);
        if (item is null) return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.NotFound, "Partner was not found.");
        if (await repository.PartnerSlugExistsAsync(request.Slug, id, cancellationToken))
            return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.Conflict, "Partner slug is already in use.");
        item.Update(request.Name.Trim(), request.Slug.Trim(), Clean(request.LogoUrl),
            Clean(request.WebsiteUrl), Clean(request.Description), request.SortOrder,
            request.IsVisible, request.IsFeatured, timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(item));
    }

    public async Task<CmsOperationResult<AdminPartnerResponse>> SetPartnerVisibilityAsync(
        Guid id, bool visible, CancellationToken cancellationToken)
    {
        var item = await repository.FindPartnerAsync(id, cancellationToken);
        if (item is null) return CmsOperationResult.Failure<AdminPartnerResponse>(CmsFailureKind.NotFound, "Partner was not found.");
        if (visible) item.Show(timeProvider.GetUtcNow()); else item.Hide(timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return CmsOperationResult.Success(MapAdmin(item));
    }

    private static List<string> ValidateHomepage(UpdateHomepageContentRequest request)
    {
        List<string> errors = [];
        Required(request.HeroTitle, 200, "Hero title", errors);
        Required(request.HeroDescription, 1000, "Hero description", errors);
        Required(request.PrimaryCtaLabel, 100, "Primary CTA label", errors);
        Required(request.WhyTitle, 200, "Why title", errors);
        Required(request.WhyDescription, 2000, "Why description", errors);
        Required(request.ServicesTitle, 200, "Services title", errors);
        Required(request.ServicesDescription, 1000, "Services description", errors);
        Required(request.PartnersTitle, 200, "Partners title", errors);
        Required(request.PartnersDescription, 1000, "Partners description", errors);
        Required(request.ContactTitle, 200, "Contact title", errors);
        Required(request.ContactDescription, 1000, "Contact description", errors);
        Required(request.ContactCtaLabel, 100, "Contact CTA label", errors);
        Optional(request.HeroEyebrow, 100, "Hero eyebrow", errors);
        Optional(request.HeroAccent, 200, "Hero accent", errors);
        Optional(request.SecondaryCtaLabel, 100, "Secondary CTA label", errors);
        Optional(request.PrimaryCtaHref, 2048, "Primary CTA href", errors);
        Optional(request.SecondaryCtaHref, 2048, "Secondary CTA href", errors);
        Optional(request.ContactCtaHref, 2048, "Contact CTA href", errors);
        ValidateHref(request.PrimaryCtaHref, "Primary CTA href", errors);
        ValidateHref(request.ContactCtaHref, "Contact CTA href", errors);
        if (string.IsNullOrWhiteSpace(request.SecondaryCtaLabel) != string.IsNullOrWhiteSpace(request.SecondaryCtaHref))
            errors.Add("Secondary CTA label and href must either both be provided or both be empty.");
        if (!string.IsNullOrWhiteSpace(request.SecondaryCtaHref)) ValidateHref(request.SecondaryCtaHref, "Secondary CTA href", errors);
        return errors;
    }

    private static List<string> ValidateStatistic(SaveStatisticRequest request)
    {
        List<string> errors = [];
        Required(request.Label, 100, "Statistic label", errors);
        Required(request.Value, 50, "Statistic value", errors);
        Optional(request.Suffix, 20, "Statistic suffix", errors);
        Optional(request.Description, 500, "Statistic description", errors);
        if (request.SortOrder < 0) errors.Add("Statistic sort order must be non-negative.");
        return errors;
    }

    private static List<string> ValidatePartner(SavePartnerRequest request)
    {
        List<string> errors = [];
        Required(request.Name, 150, "Partner name", errors);
        Required(request.Slug, 160, "Partner slug", errors);
        Optional(request.Description, 500, "Partner description", errors);
        Optional(request.LogoUrl, 2048, "Partner logo URL", errors);
        Optional(request.WebsiteUrl, 2048, "Partner website URL", errors);
        if (!IsSlug(request.Slug)) errors.Add("Partner slug must contain lowercase letters, numbers, and single hyphens only.");
        if (request.SortOrder < 0) errors.Add("Partner sort order must be non-negative.");
        ValidateAbsoluteUrl(request.LogoUrl, "Partner logo URL", errors);
        ValidateAbsoluteUrl(request.WebsiteUrl, "Partner website URL", errors);
        return errors;
    }

    private static void Required(string? value, int maximumLength, string name, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value)) errors.Add($"{name} is required.");
        else if (value.Length > maximumLength) errors.Add($"{name} must not exceed {maximumLength} characters.");
    }

    private static void Optional(string? value, int maximumLength, string name, List<string> errors)
    {
        if (value?.Length > maximumLength) errors.Add($"{name} must not exceed {maximumLength} characters.");
    }

    private static void ValidateHref(string? value, string name, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value)) { errors.Add($"{name} is required."); return; }
        if (value.StartsWith('/') && !value.StartsWith("//", StringComparison.Ordinal)) return;
        if (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https") return;
        errors.Add($"{name} must be a root-relative path or an absolute HTTP or HTTPS URL.");
    }

    private static void ValidateAbsoluteUrl(string? value, string name, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))
            errors.Add($"{name} must be an absolute HTTP or HTTPS URL.");
    }

    private static bool IsSlug(string? value) => !string.IsNullOrWhiteSpace(value)
        && value.All(character => char.IsAsciiLetterOrDigit(character) || character == '-')
        && string.Equals(value, value.ToLowerInvariant(), StringComparison.Ordinal)
        && !value.StartsWith('-') && !value.EndsWith('-') && !value.Contains("--", StringComparison.Ordinal);

    private static HomepageContent CreateHomepage(UpdateHomepageContentRequest request, DateTimeOffset now) =>
        new(HomepageContent.SingletonId, (request.HeroEyebrow ?? string.Empty).Trim(), request.HeroTitle.Trim(),
            Clean(request.HeroAccent), request.HeroDescription.Trim(), request.PrimaryCtaLabel.Trim(),
            request.PrimaryCtaHref.Trim(), Clean(request.SecondaryCtaLabel), Clean(request.SecondaryCtaHref),
            request.WhyTitle.Trim(), request.WhyDescription.Trim(), request.ServicesTitle.Trim(),
            request.ServicesDescription.Trim(), request.PartnersTitle.Trim(), request.PartnersDescription.Trim(),
            request.ContactTitle.Trim(), request.ContactDescription.Trim(), request.ContactCtaLabel.Trim(),
            request.ContactCtaHref.Trim(), request.IsPublished, now);

    private static void Apply(HomepageContent content, UpdateHomepageContentRequest request, DateTimeOffset now) =>
        content.Update((request.HeroEyebrow ?? string.Empty).Trim(), request.HeroTitle.Trim(), Clean(request.HeroAccent),
            request.HeroDescription.Trim(), request.PrimaryCtaLabel.Trim(), request.PrimaryCtaHref.Trim(),
            Clean(request.SecondaryCtaLabel), Clean(request.SecondaryCtaHref), request.WhyTitle.Trim(),
            request.WhyDescription.Trim(), request.ServicesTitle.Trim(), request.ServicesDescription.Trim(),
            request.PartnersTitle.Trim(), request.PartnersDescription.Trim(), request.ContactTitle.Trim(),
            request.ContactDescription.Trim(), request.ContactCtaLabel.Trim(), request.ContactCtaHref.Trim(),
            request.IsPublished, now);

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static CmsOperationResult<T> Failure<T>(CmsFailureKind kind, IReadOnlyList<string> errors) => new(default, errors, kind);

    private static PublicHomepageContentResponse MapPublic(HomepageContent item) => new(
        item.HeroEyebrow, item.HeroTitle, item.HeroAccent, item.HeroDescription,
        item.PrimaryCtaLabel, item.PrimaryCtaHref, item.SecondaryCtaLabel, item.SecondaryCtaHref,
        item.WhyTitle, item.WhyDescription, item.ServicesTitle, item.ServicesDescription,
        item.PartnersTitle, item.PartnersDescription, item.ContactTitle, item.ContactDescription,
        item.ContactCtaLabel, item.ContactCtaHref);
    private static PublicStatisticResponse MapPublic(StatisticItem item) => new(item.Label, item.Value, item.Suffix, item.Description);
    private static PublicPartnerResponse MapPublic(Partner item) => new(item.Name, item.Slug, item.LogoUrl, item.WebsiteUrl, item.Description, item.IsFeatured);
    private static AdminHomepageContentResponse MapAdmin(HomepageContent item) => new(
        item.Id, item.HeroEyebrow, item.HeroTitle, item.HeroAccent, item.HeroDescription,
        item.PrimaryCtaLabel, item.PrimaryCtaHref, item.SecondaryCtaLabel, item.SecondaryCtaHref,
        item.WhyTitle, item.WhyDescription, item.ServicesTitle, item.ServicesDescription,
        item.PartnersTitle, item.PartnersDescription, item.ContactTitle, item.ContactDescription,
        item.ContactCtaLabel, item.ContactCtaHref, item.IsPublished, item.CreatedAtUtc, item.UpdatedAtUtc);
    private static AdminStatisticResponse MapAdmin(StatisticItem item) => new(item.Id, item.Label,
        item.Value, item.Suffix, item.Description, item.SortOrder, item.IsVisible, item.IsVerified,
        item.CreatedAtUtc, item.UpdatedAtUtc);
    private static AdminPartnerResponse MapAdmin(Partner item) => new(item.Id, item.Name, item.Slug,
        item.LogoUrl, item.WebsiteUrl, item.Description, item.SortOrder, item.IsVisible,
        item.IsFeatured, item.CreatedAtUtc, item.UpdatedAtUtc);
}
