using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Homepage;
using TheDomain.Domain.Homepage;

namespace TheDomain.Infrastructure.Persistence;

public sealed class HomepageCmsRepository(TheDomainDbContext dbContext) : IHomepageCmsRepository
{
    public Task<HomepageContent?> GetHomepageAsync(CancellationToken cancellationToken) =>
        dbContext.HomepageContent.SingleOrDefaultAsync(item => item.Id == HomepageContent.SingletonId, cancellationToken);

    public async Task<IReadOnlyList<StatisticItem>> ListStatisticsAsync(CancellationToken cancellationToken) =>
        await dbContext.HomepageStatistics.AsNoTracking().OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Label).ToListAsync(cancellationToken);

    public Task<StatisticItem?> FindStatisticAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.HomepageStatistics.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken cancellationToken) =>
        await dbContext.Partners.AsNoTracking().OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Name).ToListAsync(cancellationToken);

    public Task<Partner?> FindPartnerAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Partners.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

    public Task<bool> PartnerSlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) =>
        dbContext.Partners.AnyAsync(item => item.Slug == slug
            && (!excludingId.HasValue || item.Id != excludingId.Value), cancellationToken);

    public void AddHomepage(HomepageContent content) => dbContext.HomepageContent.Add(content);
    public void AddStatistic(StatisticItem statistic) => dbContext.HomepageStatistics.Add(statistic);
    public void AddPartner(Partner partner) => dbContext.Partners.Add(partner);
    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
}
