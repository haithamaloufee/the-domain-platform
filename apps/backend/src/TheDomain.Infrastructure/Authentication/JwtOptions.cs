using System.ComponentModel.DataAnnotations;

namespace TheDomain.Infrastructure.Authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Authentication";
    public bool Enabled { get; init; }
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string SigningKey { get; init; } = string.Empty;

    [Range(5, 60)]
    public int AccessTokenLifetimeMinutes { get; init; } = 15;

    [Range(1, 90)]
    public int RefreshTokenLifetimeDays { get; init; } = 14;
}
