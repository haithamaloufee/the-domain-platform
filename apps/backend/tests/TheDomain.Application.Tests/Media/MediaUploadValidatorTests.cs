using TheDomain.Application.Media;

namespace TheDomain.Application.Tests.Media;

public sealed class MediaUploadValidatorTests
{
    private static readonly MediaUploadPolicy Policy = new(10, 20, new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase) { ["image/jpeg"] = [".jpg", ".jpeg"], ["video/mp4"] = [".mp4"] });

    [Fact]
    public void RejectsUnsupportedMimeType()
    {
        var errors = MediaUploadValidator.Validate(5, "payload.exe", "application/octet-stream", Policy);
        Assert.Contains(errors, error => error.Contains("MIME", StringComparison.Ordinal));
    }

    [Fact]
    public void RejectsOversizedFile()
    {
        var errors = MediaUploadValidator.Validate(11, "photo.jpg", "image/jpeg", Policy);
        Assert.Contains(errors, error => error.Contains("size limit", StringComparison.Ordinal));
    }
}
