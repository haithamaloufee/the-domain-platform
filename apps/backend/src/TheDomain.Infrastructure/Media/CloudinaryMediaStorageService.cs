using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using TheDomain.Application.Media;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Media;

public sealed class CloudinaryMediaStorageService : IMediaStorageService
{
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
        return new(video.SecureUrl.AbsoluteUri, null, video.PublicId, video.Width, video.Height, Convert.ToDecimal(video.Duration, System.Globalization.CultureInfo.InvariantCulture));
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
