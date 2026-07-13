using TheDomain.Application.Media.Contracts;

namespace TheDomain.Application.Media;

public interface IMediaQueryService
{
    Task<PagedResponse<AdminMediaListItemResponse>> GetAsync(MediaListQuery query, CancellationToken token);
    Task<AdminMediaResponse?> GetByIdAsync(Guid id, CancellationToken token);
}
