using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.EnvironmentVariables;
using Microsoft.Extensions.Configuration.Memory;

namespace TheDomain.Api.Configuration;

public static class ConfigurationBuilderExtensions
{
    public static IConfigurationBuilder AddDotEnvFile(this IConfigurationBuilder builder, string? path = null)
    {
        ArgumentNullException.ThrowIfNull(builder);

        var resolvedPath = ResolveDotEnvPath(path);
        if (string.IsNullOrWhiteSpace(resolvedPath) || !File.Exists(resolvedPath))
        {
            return builder;
        }

        var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var line in File.ReadLines(resolvedPath))
        {
            var trimmedLine = line.Trim();
            if (trimmedLine.Length == 0 || trimmedLine.StartsWith('#'))
            {
                continue;
            }

            var separatorIndex = trimmedLine.IndexOf('=');
            if (separatorIndex <= 0)
            {
                continue;
            }

            var key = trimmedLine[..separatorIndex].Trim();
            var value = trimmedLine[(separatorIndex + 1)..].Trim();
            if (value.Length >= 2 && ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
            {
                value = value[1..^1];
            }

            values[NormalizeKey(key)] = value;
        }

        if (values.Count > 0)
        {
            var environmentVariablesIndex = builder.Sources
                .Select((source, index) => (source, index))
                .Where(item => item.source is EnvironmentVariablesConfigurationSource)
                .Select(item => item.index)
                .DefaultIfEmpty(builder.Sources.Count)
                .Last();

            builder.Sources.Insert(environmentVariablesIndex, new MemoryConfigurationSource
            {
                InitialData = values
            });
        }

        return builder;
    }

    private static string NormalizeKey(string key)
    {
        return key.Replace("__", ":", StringComparison.Ordinal);
    }

    private static string? ResolveDotEnvPath(string? path)
    {
        if (!string.IsNullOrWhiteSpace(path))
        {
            return Path.GetFullPath(path);
        }

        var currentDirectory = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (currentDirectory is not null)
        {
            foreach (var candidate in new[] { ".env.local", ".env" })
            {
                var candidatePath = Path.Combine(currentDirectory.FullName, candidate);
                if (File.Exists(candidatePath))
                {
                    return Path.GetFullPath(candidatePath);
                }
            }

            currentDirectory = currentDirectory.Parent;
        }

        var executableDirectory = new DirectoryInfo(AppContext.BaseDirectory);
        while (executableDirectory is not null)
        {
            foreach (var candidate in new[] { ".env.local", ".env" })
            {
                var candidatePath = Path.Combine(executableDirectory.FullName, candidate);
                if (File.Exists(candidatePath))
                {
                    return Path.GetFullPath(candidatePath);
                }
            }

            executableDirectory = executableDirectory.Parent;
        }

        return null;
    }
}
