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
    public Task<PublicAboutResponse> GetPublicAboutAsync(CancellationToken token) => Task.FromResult(
        new PublicAboutResponse(new(true, null, Domain.About.AboutHeroPresentation.EditorialSplit,
            true, true, true, true, null), [], []));
}
