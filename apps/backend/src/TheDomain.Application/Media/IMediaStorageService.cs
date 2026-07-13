using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public interface IMediaStorageService
{
    Task<StoredMediaResult> UploadAsync(Stream content, string fileName, string publicId, MediaType mediaType, CancellationToken cancellationToken);
    Task DeleteAsync(string publicId, MediaType mediaType, CancellationToken cancellationToken);
}

public sealed record StoredMediaResult(string Url, string? ThumbnailUrl, string PublicId, int? Width, int? Height, decimal? DurationSeconds);
