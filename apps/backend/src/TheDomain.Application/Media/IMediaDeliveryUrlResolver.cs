using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public interface IMediaDeliveryUrlResolver
{
    string? ResolveThumbnailUrl(
        MediaType mediaType,
        string mediaUrl,
        string? thumbnailUrl,
        string? storagePublicId);
}
