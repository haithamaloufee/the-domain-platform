using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Events;
using TheDomain.Domain.Events;

namespace TheDomain.Infrastructure.Persistence;

public sealed class EventRepository(TheDomainDbContext dbContext) : IEventRepository
{
    public async Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) => await Query().OrderBy(item => item.StartAtUtc).ToListAsync(cancellationToken);
    public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) => Query().SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) => Query().SingleOrDefaultAsync(item => item.Slug == slug, cancellationToken);
    public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => dbContext.Events.AnyAsync(item => item.Slug == slug && (!excludingId.HasValue || item.Id != excludingId.Value), cancellationToken);
    public void Add(EntertainmentEvent eventEntity) => dbContext.Events.Add(eventEntity);
    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
    private IQueryable<EntertainmentEvent> Query() => dbContext.Events.AsSplitQuery().Include(item => item.Media).ThenInclude(link => link.MediaAsset);
}
