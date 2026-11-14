using System.Text;

namespace TheDomain.Application.Events;

public static class EventSlugGenerator
{
    public const int MaximumLength = 160;

    public static string FromTitle(string title, Guid eventId)
    {
        var normalized = Normalize(title);
        return normalized.Length > 0 ? normalized : ($"event-{eventId:N}")[..14];
    }

    public static string Normalize(string value)
    {
        var result = new StringBuilder(Math.Min(value.Length, MaximumLength));
        var separatorPending = false;

        foreach (var character in value.Trim().ToLowerInvariant())
        {
            if (char.IsAsciiLetterOrDigit(character))
            {
                if (separatorPending && result.Length > 0 && result.Length < MaximumLength)
                    result.Append('-');
                if (result.Length < MaximumLength) result.Append(character);
                separatorPending = false;
                continue;
            }

            if (character is '\'' or '\u2019') continue;
            separatorPending = result.Length > 0;
        }

        return result.ToString().TrimEnd('-');
    }

    public static string WithCollisionSuffix(string baseSlug, int occurrence)
    {
        if (occurrence <= 1) return baseSlug;
        var suffix = $"-{occurrence}";
        var maximumBaseLength = MaximumLength - suffix.Length;
        var trimmedBase = baseSlug[..Math.Min(baseSlug.Length, maximumBaseLength)].TrimEnd('-');
        return $"{trimmedBase}{suffix}";
    }

    public static bool IsValid(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= MaximumLength &&
        value.All(character => char.IsAsciiLetterOrDigit(character) || character == '-') &&
        !value.StartsWith('-') &&
        !value.EndsWith('-') &&
        !value.Contains("--", StringComparison.Ordinal) &&
        string.Equals(value, value.ToLowerInvariant(), StringComparison.Ordinal);
}
