using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TheDomain.Infrastructure.Persistence;

public sealed class TheDomainDbContextFactory : IDesignTimeDbContextFactory<TheDomainDbContext>
{
    private const string ConnectionStringEnvironmentVariable = "Database__ConnectionString";

    public TheDomainDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable);

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"Set {ConnectionStringEnvironmentVariable} before running Entity Framework Core design-time commands.");
        }

        var options = new DbContextOptionsBuilder<TheDomainDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new TheDomainDbContext(options);
    }
}
