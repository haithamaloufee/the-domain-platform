using Microsoft.Extensions.Configuration;
using TheDomain.Api.Configuration;

namespace TheDomain.Api.Tests.Configuration;

public sealed class ConfigurationBuilderExtensionsTests
{
    [Fact]
    public void AddDotEnvFileParsesDoubleUnderscoreKeysAsSections()
    {
        var tempDirectory = Path.Combine(Path.GetTempPath(), $"the-domain-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempDirectory);

        try
        {
            var envFile = Path.Combine(tempDirectory, ".env.local");
            File.WriteAllText(envFile, "Cloudinary__CloudName=test-cloud\nCloudinary__Enabled=true\n");

            var configuration = new ConfigurationBuilder()
                .AddDotEnvFile(envFile)
                .Build();

            Assert.Equal("test-cloud", configuration["Cloudinary:CloudName"]);
            Assert.Equal("true", configuration["Cloudinary:Enabled"]);
        }
        finally
        {
            if (Directory.Exists(tempDirectory))
            {
                Directory.Delete(tempDirectory, recursive: true);
            }
        }
    }
}
