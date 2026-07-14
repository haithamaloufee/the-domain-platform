using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using TheDomain.Application.Media;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Media;

public sealed class CloudinaryMediaStorageService : IMediaStorageService, IMediaDeliveryUrlResolver
{
    private const int VideoThumbnailWidth = 960;
    private readonly CloudinaryOptions _options;
    private readonly Cloudinary _cloudinary;

    public CloudinaryMediaStorageService(IOptions<CloudinaryOptions> options)
    {
        _options = options.Value;
        _cloudinary = new Cloudinary(new Account(_options.CloudName, _options.ApiKey, _options.ApiSecret)) { Api = { Secure = true } };
    }

    public async Task<StoredMediaResult> UploadAsync(Stream content, string fileName, string publicId, MediaType mediaType, CancellationToken cancellationToken)
    {
        if (!_options.Enabled) throw new InvalidOperationException("Cloudinary media storage is not enabled.");
        var fullPublicId = $"{_options.FolderPrefix.Trim('/')}/{publicId}";
        if (mediaType == MediaType.Image)
        {
            var result = await _cloudinary.UploadAsync(new ImageUploadParams { File = new FileDescription(fileName, content), PublicId = fullPublicId, Overwrite = false }, cancellationToken);
            EnsureSuccess(result.Error);
            return new(result.SecureUrl.AbsoluteUri, null, result.PublicId, result.Width, result.Height, null);
        }
        var video = await _cloudinary.UploadAsync(new VideoUploadParams { File = new FileDescription(fileName, content), PublicId = fullPublicId, Overwrite = false }, cancellationToken);
        EnsureSuccess(video.Error);
        return new(video.SecureUrl.AbsoluteUri, BuildVideoThumbnailUrl(video.PublicId), video.PublicId, video.Width, video.Height, Convert.ToDecimal(video.Duration, System.Globalization.CultureInfo.InvariantCulture));
    }

    internal string BuildVideoThumbnailUrl(string publicId) =>
        _cloudinary.Api.UrlVideoUp
            .Transform(new Transformation()
                .StartOffsetAuto()
                .Width(VideoThumbnailWidth)
                .Crop("limit")
                .Quality("auto"))
            .Secure(true)
            .BuildUrl($"{publicId}.jpg");

    public string? ResolveThumbnailUrl(
        MediaType mediaType,
        string mediaUrl,
        string? thumbnailUrl,
        string? storagePublicId)
    {
        if (!string.IsNullOrWhiteSpace(thumbnailUrl)) return thumbnailUrl;
        if (mediaType != MediaType.Video) return null;

        var thumbnailFromStoredUrl = TryBuildVideoThumbnailUrl(mediaUrl);
        if (thumbnailFromStoredUrl is not null)
        {
            return thumbnailFromStoredUrl;
        }

        if (!string.IsNullOrWhiteSpace(storagePublicId) && !string.IsNullOrWhiteSpace(_options.CloudName))
        {
            return BuildVideoThumbnailUrl(storagePublicId);
        }

        return null;
    }

    private static string? TryBuildVideoThumbnailUrl(string mediaUrl)
    {
        if (!Uri.TryCreate(mediaUrl, UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps ||
            !string.Equals(uri.Host, "res.cloudinary.com", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        const string uploadPath = "/video/upload/";
        const string transformation = "c_limit,q_auto,so_auto,w_960/";
        var uploadIndex = uri.AbsolutePath.IndexOf(uploadPath, StringComparison.Ordinal);
        var extensionIndex = uri.AbsolutePath.LastIndexOf('.');
        if (uploadIndex < 0 || extensionIndex <= uploadIndex + uploadPath.Length)
        {
            return null;
        }

        var transformedPath = uri.AbsolutePath.Insert(
            uploadIndex + uploadPath.Length,
            transformation);
        transformedPath = $"{transformedPath[..(extensionIndex + transformation.Length)]}.jpg";
        return new UriBuilder(uri) { Path = transformedPath, Query = string.Empty, Fragment = string.Empty }.Uri.AbsoluteUri;
    }

    public async Task DeleteAsync(string publicId, MediaType mediaType, CancellationToken cancellationToken)
    {
        if (!_options.Enabled) return;
        cancellationToken.ThrowIfCancellationRequested();
        await _cloudinary.DestroyAsync(new DeletionParams(publicId) { ResourceType = mediaType == MediaType.Video ? ResourceType.Video : ResourceType.Image });
    }

    private static void EnsureSuccess(Error? error)
    {
        if (error is not null) throw new InvalidOperationException("Cloudinary rejected the media operation.");
    }
}
