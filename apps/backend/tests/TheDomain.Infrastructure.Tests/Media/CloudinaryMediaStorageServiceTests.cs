using Microsoft.Extensions.Options;
using TheDomain.Domain.Media;
using TheDomain.Infrastructure.Media;

namespace TheDomain.Infrastructure.Tests.Media;

public sealed class CloudinaryMediaStorageServiceTests
{
    [Fact]
    public void VideoThumbnailUsesSecureCloudinaryJpegTransformation()
    {
        var service = new CloudinaryMediaStorageService(Options.Create(new CloudinaryOptions
        {
            Enabled = true,
            CloudName = "test-cloud",
            ApiKey = "test-key",
            ApiSecret = "test-secret"
        }));

        var url = service.BuildVideoThumbnailUrl("the-domain/video-id");

        Assert.StartsWith("https://res.cloudinary.com/test-cloud/video/upload/", url, StringComparison.Ordinal);
        Assert.Contains("so_auto", url, StringComparison.Ordinal);
        Assert.Contains("w_960", url, StringComparison.Ordinal);
        Assert.EndsWith("/the-domain/video-id.jpg", url, StringComparison.Ordinal);
    }

    [Fact]
    public void LegacyVideoWithoutStoredThumbnailReceivesGeneratedThumbnail()
    {
        var service = CreateService();

        var url = service.ResolveThumbnailUrl(
            MediaType.Video,
            "https://res.cloudinary.com/test-cloud/video/upload/v1/the-domain/legacy-video.mp4",
            null,
            "the-domain/legacy-video");

        Assert.NotNull(url);
        Assert.StartsWith("https://res.cloudinary.com/test-cloud/video/upload/", url, StringComparison.Ordinal);
        Assert.EndsWith("/the-domain/legacy-video.jpg", url, StringComparison.Ordinal);
    }

    [Fact]
    public void ExistingThumbnailIsPreserved()
    {
        var service = CreateService();
        const string existingThumbnail = "https://example.com/existing-poster.jpg";

        var url = service.ResolveThumbnailUrl(
            MediaType.Video,
            "https://res.cloudinary.com/test-cloud/video/upload/v1/the-domain/video.mp4",
            existingThumbnail,
            "the-domain/video");

        Assert.Equal(existingThumbnail, url);
    }

    [Fact]
    public void LegacyCloudinaryVideoWithoutPublicIdUsesItsExistingUrl()
    {
        var service = CreateService();

        var url = service.ResolveThumbnailUrl(
            MediaType.Video,
            "https://res.cloudinary.com/legacy-cloud/video/upload/v42/legacy/video.webm",
            null,
            null);

        Assert.Equal(
            "https://res.cloudinary.com/legacy-cloud/video/upload/c_limit,q_auto,so_auto,w_960/v42/legacy/video.jpg",
            url);
    }

    [Theory]
    [InlineData("/media/legacy.mp4")]
    [InlineData("https://example.com/media/legacy.mp4")]
    [InlineData("not-a-url")]
    public void UnsupportedLegacyVideoUrlKeepsSafeMissingThumbnailFallback(string mediaUrl)
    {
        var service = CreateService();

        var url = service.ResolveThumbnailUrl(MediaType.Video, mediaUrl, null, null);

        Assert.Null(url);
    }

    private static CloudinaryMediaStorageService CreateService() => new(Options.Create(new CloudinaryOptions
    {
        Enabled = true,
        CloudName = "test-cloud",
        ApiKey = "test-key",
        ApiSecret = "test-secret"
    }));
}
