using TheDomain.Application.Events.Contracts;

namespace TheDomain.Application.Events;

public interface IEventService
{
    Task<IReadOnlyList<PublicEventListResponse>> GetUpcomingAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PublicEventListResponse>> GetPreviousAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PublicEventListResponse>> GetFeaturedAsync(CancellationToken cancellationToken);
    Task<PublicEventDetailsResponse?> GetPublicBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<IReadOnlyList<GalleryAlbumListResponse>> GetGalleryAlbumsAsync(CancellationToken cancellationToken);
    Task<GalleryAlbumDetailsResponse?> GetGalleryAlbumAsync(string slug, CancellationToken cancellationToken);
    Task<IReadOnlyList<AdminEventResponse>> GetAdminEventsAsync(CancellationToken cancellationToken);
    Task<AdminEventResponse?> GetAdminByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<EventOperationResult<AdminEventResponse>> CreateAsync(SaveEventRequest request, CancellationToken cancellationToken);
    Task<EventOperationResult<AdminEventResponse>> UpdateAsync(Guid id, SaveEventRequest request, CancellationToken cancellationToken);
    Task<EventOperationResult<AdminEventResponse>> PublishAsync(Guid id, CancellationToken cancellationToken);
    Task<EventOperationResult<AdminEventResponse>> ArchiveAsync(Guid id, CancellationToken cancellationToken);
    Task<EventOperationResult<AdminEventResponse>> CancelAsync(Guid id, CancellationToken cancellationToken);
}
