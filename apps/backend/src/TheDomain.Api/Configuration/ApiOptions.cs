using System.ComponentModel.DataAnnotations;

namespace TheDomain.Api.Configuration;

public sealed class ApiOptions
{
    public const string SectionName = "Api";

    [Required]
    public string ApplicationName { get; init; } = string.Empty;

    [Required]
    public string Version { get; init; } = string.Empty;
}
