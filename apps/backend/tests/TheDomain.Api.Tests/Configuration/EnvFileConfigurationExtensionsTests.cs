using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using TheDomain.Api.Configuration;

namespace TheDomain.Api.Tests.Configuration;

public sealed class EnvFileConfigurationExtensionsTests
{
    [Fact]
    public void AddDotEnvFileLoadsValuesFromFile()
    {
        var path = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.env");
        File.WriteAllText(path, "Database__Enabled=true\nDatabase__ConnectionString=Host=localhost;Port=5432\n");

        try
        {
            var configuration = new ConfigurationBuilder()
                .AddDotEnvFile(path)
                .Build();

            Assert.Equal("true", configuration["Database:Enabled"]);
            Assert.Equal("Host=localhost;Port=5432", configuration["Database:ConnectionString"]);
        }
        finally
        {
            File.Delete(path);
        }
    }

    [Fact]
    public void AddDotEnvFileDoesNotOverrideProcessEnvironment()
    {
        var path = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.env");
        var prefix = $"THE_DOMAIN_TEST_{Guid.NewGuid():N}_";
        var environmentKey = $"{prefix}Cloudinary__Enabled";
        File.WriteAllText(path, "Cloudinary__Enabled=false\n");
        Environment.SetEnvironmentVariable(environmentKey, "true");

        try
        {
            var configuration = new ConfigurationBuilder()
                .AddEnvironmentVariables(prefix)
                .AddDotEnvFile(path)
                .Build();

            Assert.Equal("true", configuration["Cloudinary:Enabled"]);
        }
        finally
        {
            Environment.SetEnvironmentVariable(environmentKey, null);
            File.Delete(path);
        }
    }

    [Fact]
    public void AddDotEnvFileOverridesWebApplicationJsonDefaults()
    {
        var tempDirectory = Path.Combine(Path.GetTempPath(), $"the-domain-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempDirectory);

        try
        {
            File.WriteAllText(
                Path.Combine(tempDirectory, "appsettings.json"),
                """{"Database":{"Enabled":false}}""");
            var envFile = Path.Combine(tempDirectory, ".env.local");
            File.WriteAllText(envFile, "Database__Enabled=true\n");

            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                ContentRootPath = tempDirectory,
                EnvironmentName = "Production"
            });

            builder.Configuration.AddDotEnvFile(envFile);

            Assert.Equal("true", builder.Configuration["Database:Enabled"]);
        }
        finally
        {
            Directory.Delete(tempDirectory, recursive: true);
        }
    }
}
