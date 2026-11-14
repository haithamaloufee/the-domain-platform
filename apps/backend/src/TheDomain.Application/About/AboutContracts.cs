using TheDomain.Domain.About;
using TheDomain.Domain.Media;

namespace TheDomain.Application.About;

public sealed record SaveAboutSettingsRequest(bool IsPublished, bool IsHeroEnabled,
    Guid? HeroMediaAssetId, AboutHeroPresentation HeroPresentation, bool IsStoryEnabled,
    bool IsTeamEnabled, bool IsPartnersEnabled, bool IsReachOutEnabled,
    Guid? SocialImageMediaAssetId);
public sealed record SaveTeamMemberRequest(string Name, string Role, string? Biography,
    Guid PhotoMediaAssetId, string? ProfileUrl, bool IsVisible);
public sealed record ReorderTeamRequest(IReadOnlyList<Guid> Ids);
public sealed record AboutMediaResponse(Guid Id, MediaType MediaType, string Url,
    string? PosterUrl, string? AltText);
public sealed record AboutSettingsResponse(Guid Id, bool IsPublished, bool IsHeroEnabled,
    Guid? HeroMediaAssetId, AboutMediaResponse? HeroMedia, AboutHeroPresentation HeroPresentation,
    bool IsStoryEnabled, bool IsTeamEnabled, bool IsPartnersEnabled, bool IsReachOutEnabled,
    Guid? SocialImageMediaAssetId, AboutMediaResponse? SocialImage,
    DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record TeamMemberResponse(Guid Id, string Name, string Role, string? Biography,
    Guid PhotoMediaAssetId, string PhotoUrl, string? PhotoAltText, string? ProfileUrl,
    bool IsVisible, int SortOrder, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc);
public sealed record PublicAboutSettingsResponse(bool IsHeroEnabled, AboutMediaResponse? HeroMedia,
    AboutHeroPresentation HeroPresentation, bool IsStoryEnabled, bool IsTeamEnabled,
    bool IsPartnersEnabled, bool IsReachOutEnabled, string? SocialImageUrl);
public sealed record PublicTeamMemberResponse(Guid Id, string Name, string Role,
    string? Biography, string PhotoUrl, string? PhotoAltText, string? ProfileUrl);
public sealed record PublicAboutResponse(PublicAboutSettingsResponse Settings,
    IReadOnlyList<PublicTeamMemberResponse> Team,
    IReadOnlyList<TheDomain.Application.Homepage.Contracts.PublicPartnerResponse> Partners);
