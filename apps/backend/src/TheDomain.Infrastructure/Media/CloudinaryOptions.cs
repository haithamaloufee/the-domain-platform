using System.ComponentModel.DataAnnotations;

namespace TheDomain.Infrastructure.Media;

public sealed class CloudinaryOptions
{
    public const string SectionName = "Cloudinary";
    public bool Enabled { get; init; }
    public string CloudName { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
    public string ApiSecret { get; init; } = string.Empty;
    public string FolderPrefix { get; init; } = "the-domain";
    [Range(1, 100)] public int MaxImageSizeMb { get; init; } = 15;
    [Range(1, 500)] public int MaxVideoSizeMb { get; init; } = 100;
    public string[] AllowedImageMimeTypes { get; init; } = ["image/jpeg", "image/png", "image/webp"];
    public string[] AllowedVideoMimeTypes { get; init; } = ["video/mp4", "video/webm"];
}
