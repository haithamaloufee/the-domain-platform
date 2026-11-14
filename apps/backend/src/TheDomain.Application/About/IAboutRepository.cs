using TheDomain.Domain.About;
using TheDomain.Domain.Homepage;
using TheDomain.Domain.Media;

namespace TheDomain.Application.About;

public interface IAboutRepository
{
    Task<AboutSettings?> GetSettingsAsync(CancellationToken token);
    Task<IReadOnlyList<TeamMember>> ListTeamAsync(CancellationToken token);
    Task<TeamMember?> FindTeamMemberAsync(Guid id, CancellationToken token);
    Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token);
    Task<IReadOnlyDictionary<Guid, MediaAsset>> ListMediaAsync(IReadOnlyCollection<Guid> ids, CancellationToken token);
    Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken token);
    void AddSettings(AboutSettings settings);
    void AddTeamMember(TeamMember member);
    void RemoveTeamMember(TeamMember member);
    Task SaveChangesAsync(CancellationToken token);
}
