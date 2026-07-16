using TheDomain.Application.Homepage;

namespace TheDomain.Application.About;

public sealed class DisabledAboutService : IAboutService
{
    private static CmsOperationResult<T> Disabled<T>() => CmsOperationResult.Failure<T>(CmsFailureKind.Conflict, "About persistence is disabled.");
    public Task<AboutSettingsResponse?> GetAdminSettingsAsync(CancellationToken token) => Task.FromResult<AboutSettingsResponse?>(null);
    public Task<CmsOperationResult<AboutSettingsResponse>> SaveSettingsAsync(SaveAboutSettingsRequest request, CancellationToken token) => Task.FromResult(Disabled<AboutSettingsResponse>());
    public Task<IReadOnlyList<TeamMemberResponse>> ListAdminTeamAsync(CancellationToken token) => Task.FromResult<IReadOnlyList<TeamMemberResponse>>([]);
    public Task<CmsOperationResult<TeamMemberResponse>> CreateTeamMemberAsync(SaveTeamMemberRequest request, CancellationToken token) => Task.FromResult(Disabled<TeamMemberResponse>());
    public Task<CmsOperationResult<TeamMemberResponse>> UpdateTeamMemberAsync(Guid id, SaveTeamMemberRequest request, CancellationToken token) => Task.FromResult(Disabled<TeamMemberResponse>());
    public Task<CmsOperationResult<TeamMemberResponse>> SetTeamVisibilityAsync(Guid id, bool visible, CancellationToken token) => Task.FromResult(Disabled<TeamMemberResponse>());
    public Task<CmsOperationResult<IReadOnlyList<TeamMemberResponse>>> ReorderTeamAsync(ReorderTeamRequest request, CancellationToken token) => Task.FromResult(Disabled<IReadOnlyList<TeamMemberResponse>>());
    public Task<CmsOperationResult<bool>> DeleteTeamMemberAsync(Guid id, CancellationToken token) => Task.FromResult(Disabled<bool>());
    public Task<PublicAboutResponse> GetPublicAboutAsync(CancellationToken token) => Task.FromResult(new PublicAboutResponse(new(true, "The company", "About The Domain", "Entertainment composed with intention.", null, Domain.About.AboutHeroPresentation.EditorialSplit, "We shape experiences where atmosphere, production, people, and place move as one.", true, "A considered approach to entertainment.", "The Domain brings creative direction and operational detail into one clear experience.", null, true, "The people behind the experience.", "A focused team connecting vision with execution.", true, "Built with trusted partners.", "Relationships that strengthen every production.", true, "Let’s create what comes next.", "Talk to The Domain about your next experience.", "Reach out", "/contact", null, null, null), [], []));
}
