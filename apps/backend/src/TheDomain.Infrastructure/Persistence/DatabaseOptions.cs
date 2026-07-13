using System.ComponentModel.DataAnnotations;

namespace TheDomain.Infrastructure.Persistence;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public bool Enabled { get; init; }

    public string? ConnectionString { get; init; }

    [Range(1, 300)]
    public int CommandTimeoutSeconds { get; init; } = 30;
}
