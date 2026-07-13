using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheDomain.Infrastructure.Persistence;

namespace TheDomain.Infrastructure.Tests.Persistence;

public sealed class PersistenceRegistrationTests
{
    [Fact]
    public void AddInfrastructureRegistersDbContextWhenDatabaseIsEnabled()
    {
        var configuration = CreateConfiguration(enabled: true);
        var services = new ServiceCollection();

        services.AddInfrastructure(configuration);

        Assert.Contains(
            services,
            descriptor => descriptor.ServiceType == typeof(DbContextOptions<TheDomainDbContext>));
    }

    [Fact]
    public void AddInfrastructureDoesNotRegisterDbContextWhenDatabaseIsDisabled()
    {
        var configuration = CreateConfiguration(enabled: false);
        var services = new ServiceCollection();

        services.AddInfrastructure(configuration);

        Assert.DoesNotContain(
            services,
            descriptor => descriptor.ServiceType == typeof(DbContextOptions<TheDomainDbContext>));
    }

    private static IConfiguration CreateConfiguration(bool enabled)
    {
        Dictionary<string, string?> values = new(StringComparer.Ordinal)
        {
            [$"{DatabaseOptions.SectionName}:Enabled"] = enabled.ToString(),
            [$"{DatabaseOptions.SectionName}:ConnectionString"] =
                "Host=localhost;Database=the_domain_tests;Username=test;Password=test",
            [$"{DatabaseOptions.SectionName}:CommandTimeoutSeconds"] = "30",
            ["Authentication:Enabled"] = "false",
            ["Authentication:AccessTokenLifetimeMinutes"] = "15",
            ["Authentication:RefreshTokenLifetimeDays"] = "14",
            ["InitialAdmin:Enabled"] = "false",
            ["Cloudinary:Enabled"] = "false",
            ["Cloudinary:MaxImageSizeMb"] = "15",
            ["Cloudinary:MaxVideoSizeMb"] = "100"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }
}
