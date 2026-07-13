using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public interface IMediaRepository
{
    Task<(IReadOnlyList<MediaAsset> Items, int TotalCount)> SearchAsync(MediaListQuery query, CancellationToken token);
    Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token);
    Task<EntertainmentEvent?> FindEventAsync(Guid id, CancellationToken token);
    Task<IReadOnlyList<EventMedia>> ListEventMediaAsync(Guid eventId, CancellationToken token);
    Task<EventMedia?> FindEventMediaAsync(Guid eventId, Guid eventMediaId, CancellationToken token);
    Task<bool> AssignmentExistsAsync(Guid eventId, Guid mediaAssetId, EventMediaUsage usage, Guid? excludingId, CancellationToken token);
    void AddMedia(MediaAsset media);
    void AddEventMedia(EventMedia eventMedia);
    void RemoveEventMedia(EventMedia eventMedia);
    Task SaveChangesAsync(CancellationToken token);
}
