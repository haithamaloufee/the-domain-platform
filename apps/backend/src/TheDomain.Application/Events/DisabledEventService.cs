using TheDomain.Application.Events.Contracts;

namespace TheDomain.Application.Events;

public sealed class DisabledEventService : IEventService
{
    private static readonly IReadOnlyList<PublicEventResponse> NoPublicEvents = [];
    private static readonly IReadOnlyList<GalleryAlbumResponse> NoAlbums = [];
    private static readonly IReadOnlyList<AdminEventResponse> NoAdminEvents = [];
    public Task<IReadOnlyList<PublicEventResponse>> GetUpcomingAsync(CancellationToken cancellationToken) => Task.FromResult(NoPublicEvents);
    public Task<IReadOnlyList<PublicEventResponse>> GetPreviousAsync(CancellationToken cancellationToken) => Task.FromResult(NoPublicEvents);
    public Task<IReadOnlyList<PublicEventResponse>> GetFeaturedAsync(CancellationToken cancellationToken) => Task.FromResult(NoPublicEvents);
    public Task<PublicEventResponse?> GetPublicBySlugAsync(string slug, CancellationToken cancellationToken) => Task.FromResult<PublicEventResponse?>(null);
    public Task<IReadOnlyList<GalleryAlbumResponse>> GetGalleryAlbumsAsync(CancellationToken cancellationToken) => Task.FromResult(NoAlbums);
    public Task<GalleryAlbumResponse?> GetGalleryAlbumAsync(string slug, CancellationToken cancellationToken) => Task.FromResult<GalleryAlbumResponse?>(null);
    public Task<IReadOnlyList<AdminEventResponse>> GetAdminEventsAsync(CancellationToken cancellationToken) => Task.FromResult(NoAdminEvents);
    public Task<AdminEventResponse?> GetAdminByIdAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult<AdminEventResponse?>(null);
    public Task<EventOperationResult<AdminEventResponse>> CreateAsync(SaveEventRequest request, CancellationToken cancellationToken) => Disabled();
    public Task<EventOperationResult<AdminEventResponse>> UpdateAsync(Guid id, SaveEventRequest request, CancellationToken cancellationToken) => Disabled();
    public Task<EventOperationResult<AdminEventResponse>> PublishAsync(Guid id, CancellationToken cancellationToken) => Disabled();
    public Task<EventOperationResult<AdminEventResponse>> ArchiveAsync(Guid id, CancellationToken cancellationToken) => Disabled();
    public Task<EventOperationResult<AdminEventResponse>> CancelAsync(Guid id, CancellationToken cancellationToken) => Disabled();
    private static Task<EventOperationResult<AdminEventResponse>> Disabled() => Task.FromResult(EventOperationResult.Failure<AdminEventResponse>("Persistence is not enabled."));
}
