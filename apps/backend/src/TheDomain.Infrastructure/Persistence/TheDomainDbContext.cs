using Microsoft.EntityFrameworkCore;
using TheDomain.Domain.Identity;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence;

public sealed class TheDomainDbContext(DbContextOptions<TheDomainDbContext> options)
    : DbContext(options)
{
    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<EntertainmentEvent> Events => Set<EntertainmentEvent>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<EventMedia> EventMedia => Set<EventMedia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TheDomainDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
