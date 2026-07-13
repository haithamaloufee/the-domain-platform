using TheDomain.Domain.Events;

namespace TheDomain.Application.Events;

public interface IEventRepository
{
    Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken);
    Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken);
    void Add(EntertainmentEvent eventEntity);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
