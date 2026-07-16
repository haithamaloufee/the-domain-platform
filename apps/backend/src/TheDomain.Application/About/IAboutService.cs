using TheDomain.Application.Homepage;

namespace TheDomain.Application.About;

public interface IAboutService
{
    Task<AboutSettingsResponse?> GetAdminSettingsAsync(CancellationToken token);
    Task<CmsOperationResult<AboutSettingsResponse>> SaveSettingsAsync(SaveAboutSettingsRequest request, CancellationToken token);
    Task<IReadOnlyList<TeamMemberResponse>> ListAdminTeamAsync(CancellationToken token);
    Task<CmsOperationResult<TeamMemberResponse>> CreateTeamMemberAsync(SaveTeamMemberRequest request, CancellationToken token);
    Task<CmsOperationResult<TeamMemberResponse>> UpdateTeamMemberAsync(Guid id, SaveTeamMemberRequest request, CancellationToken token);
    Task<CmsOperationResult<TeamMemberResponse>> SetTeamVisibilityAsync(Guid id, bool visible, CancellationToken token);
    Task<CmsOperationResult<IReadOnlyList<TeamMemberResponse>>> ReorderTeamAsync(ReorderTeamRequest request, CancellationToken token);
    Task<CmsOperationResult<bool>> DeleteTeamMemberAsync(Guid id, CancellationToken token);
    Task<PublicAboutResponse> GetPublicAboutAsync(CancellationToken token);
}
