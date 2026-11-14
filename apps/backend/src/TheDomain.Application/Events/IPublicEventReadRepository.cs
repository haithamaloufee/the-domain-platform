using TheDomain.Application.Events.Contracts;

namespace TheDomain.Application.Events;

public interface IPublicEventReadRepository
{
    Task<IReadOnlyList<PublicEventSummaryReadModel>> ListPublicAsync(
        PublicEventQueryKind queryKind,
        DateTimeOffset now,
        int limit,
        CancellationToken cancellationToken);

    Task<HomepageEventPreviewReadModel> GetHomepagePreviewAsync(
        DateTimeOffset now,
        int currentLimit,
        int previousLimit,
        int albumLimit,
        CancellationToken cancellationToken);
}
