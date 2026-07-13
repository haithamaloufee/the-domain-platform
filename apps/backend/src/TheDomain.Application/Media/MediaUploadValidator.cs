using TheDomain.Domain.Media;

namespace TheDomain.Application.Media;

public sealed record MediaUploadPolicy(long MaxImageBytes, long MaxVideoBytes, IReadOnlyDictionary<string, string[]> AllowedTypes);
public static class MediaUploadValidator
{
    public static IReadOnlyList<string> Validate(long length, string fileName, string contentType, MediaUploadPolicy policy)
    {
        List<string> errors = [];
        if (length <= 0) errors.Add("The uploaded file is empty.");
        var mime = contentType.Trim().ToLowerInvariant();
        if (!policy.AllowedTypes.TryGetValue(mime, out var extensions)) { errors.Add("The uploaded MIME type is not supported."); return errors; }
        var extension = Path.GetExtension(Path.GetFileName(fileName)).ToLowerInvariant();
        if (!extensions.Contains(extension, StringComparer.Ordinal)) errors.Add("The file extension does not match the uploaded MIME type.");
        var maximum = mime.StartsWith("image/", StringComparison.Ordinal) ? policy.MaxImageBytes : policy.MaxVideoBytes;
        if (length > maximum) errors.Add("The uploaded file exceeds the configured size limit.");
        return errors;
    }

    public static MediaType GetMediaType(string contentType) => contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ? MediaType.Image : MediaType.Video;
    public static string SanitizeFileName(string value)
    {
        var name = Path.GetFileName(value); var extension = Path.GetExtension(name).ToLowerInvariant();
        var stem = new string(Path.GetFileNameWithoutExtension(name).Where(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_').ToArray());
        return $"{(string.IsNullOrWhiteSpace(stem) ? "media" : stem[..Math.Min(stem.Length, 100)])}{extension}";
    }
}
