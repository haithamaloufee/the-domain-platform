using System.Globalization;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using TheDomain.Application.Media;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Media;

public sealed class CloudinaryDeliveryUrlResolver(IOptions<CloudinaryOptions> options) : IMediaDeliveryUrlResolver
{
    private const int VideoThumbnailWidth = 960;
    private readonly string _cloudName = options.Value.CloudName;

    internal static string BuildVideoThumbnailUrl(string cloudName, string publicId, string offset = "auto") =>
        new Url(cloudName)
            .ResourceType("video")
            .Action("upload")
            .Transform(new Transformation().StartOffset(offset).Width(VideoThumbnailWidth).Crop("limit").Quality("auto"))
            .Secure(true)
            .BuildUrl($"{publicId}.jpg");

    public string? ResolveThumbnailUrl(MediaType mediaType, string mediaUrl, string? thumbnailUrl, string? storagePublicId)
    {
        if (!string.IsNullOrWhiteSpace(thumbnailUrl)) return thumbnailUrl;
        if (mediaType != MediaType.Video) return null;

        return TryBuildVideoThumbnailUrl(mediaUrl, "auto") ??
            (CanBuildFromPublicId(storagePublicId) ? BuildVideoThumbnailUrl(_cloudName, storagePublicId!) : null);
    }

    public string? ResolveVideoFrameUrl(string mediaUrl, string? storagePublicId, decimal timestampSeconds)
    {
        if (timestampSeconds < 0 || timestampSeconds > EventMedia.MaximumPosterTimestampSeconds) return null;

        var offset = timestampSeconds.ToString("0.###", CultureInfo.InvariantCulture);
        return CanBuildFromPublicId(storagePublicId)
            ? BuildVideoThumbnailUrl(_cloudName, storagePublicId!, offset)
            : TryBuildVideoThumbnailUrl(mediaUrl, offset);
    }

    private bool CanBuildFromPublicId([System.Diagnostics.CodeAnalysis.NotNullWhen(true)] string? storagePublicId) =>
        !string.IsNullOrWhiteSpace(storagePublicId) && !string.IsNullOrWhiteSpace(_cloudName);

    private static string? TryBuildVideoThumbnailUrl(string mediaUrl, string offset)
    {
        if (!Uri.TryCreate(mediaUrl, UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps ||
            !string.Equals(uri.Host, "res.cloudinary.com", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        const string uploadPath = "/video/upload/";
        var uploadIndex = uri.AbsolutePath.IndexOf(uploadPath, StringComparison.Ordinal);
        var extensionIndex = uri.AbsolutePath.LastIndexOf('.');
        if (uploadIndex < 0 || extensionIndex <= uploadIndex + uploadPath.Length)
        {
            return null;
        }

        var transformation = FormattableString.Invariant($"c_limit,q_auto,so_{offset},w_{VideoThumbnailWidth}/");
        var transformedPath = uri.AbsolutePath[..extensionIndex].Insert(uploadIndex + uploadPath.Length, transformation);
        return new UriBuilder(uri) { Path = $"{transformedPath}.jpg", Query = string.Empty, Fragment = string.Empty }.Uri.AbsoluteUri;
    }
}
