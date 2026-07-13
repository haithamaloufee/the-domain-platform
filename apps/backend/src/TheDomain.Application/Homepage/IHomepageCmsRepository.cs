using TheDomain.Domain.Homepage;

namespace TheDomain.Application.Homepage;

public interface IHomepageCmsRepository
{
    Task<HomepageContent?> GetHomepageAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<StatisticItem>> ListStatisticsAsync(CancellationToken cancellationToken);
    Task<StatisticItem?> FindStatisticAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken cancellationToken);
    Task<Partner?> FindPartnerAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> PartnerSlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken);
    void AddHomepage(HomepageContent content);
    void AddStatistic(StatisticItem statistic);
    void AddPartner(Partner partner);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
