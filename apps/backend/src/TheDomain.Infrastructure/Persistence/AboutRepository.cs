using Microsoft.EntityFrameworkCore;
using TheDomain.Application.About;
using TheDomain.Domain.About;
using TheDomain.Domain.Homepage;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence;

public sealed class AboutRepository(TheDomainDbContext db) : IAboutRepository
{
    public Task<AboutSettings?> GetSettingsAsync(CancellationToken token) => db.AboutSettings.SingleOrDefaultAsync(token);
    public async Task<IReadOnlyList<TeamMember>> ListTeamAsync(CancellationToken token) => await db.TeamMembers.OrderBy(x => x.SortOrder).ThenBy(x => x.Name).ToListAsync(token);
    public Task<TeamMember?> FindTeamMemberAsync(Guid id, CancellationToken token) => db.TeamMembers.SingleOrDefaultAsync(x => x.Id == id, token);
    public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) => db.MediaAssets.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, token);
    public async Task<IReadOnlyDictionary<Guid, MediaAsset>> ListMediaAsync(IReadOnlyCollection<Guid> ids, CancellationToken token) =>
        ids.Count == 0 ? new Dictionary<Guid, MediaAsset>() : await db.MediaAssets.AsNoTracking()
            .Where(item => ids.Contains(item.Id)).ToDictionaryAsync(item => item.Id, token);
    public async Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken token) => await db.Partners.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(token);
    public void AddSettings(AboutSettings settings) => db.AboutSettings.Add(settings);
    public void AddTeamMember(TeamMember member) => db.TeamMembers.Add(member);
    public void RemoveTeamMember(TeamMember member) => db.TeamMembers.Remove(member);
    public Task SaveChangesAsync(CancellationToken token) => db.SaveChangesAsync(token);
}
