using Microsoft.EntityFrameworkCore;
using TheDomain.Domain.Identity;
using TheDomain.Infrastructure.Persistence;

namespace TheDomain.Infrastructure.Tests.Persistence;

public sealed class IdentityRepositoryTests
{
    [Fact]
    public async Task SaveChangesPersistsNewRefreshTokenAddedToTrackedUser()
    {
        var databaseName = Guid.NewGuid().ToString();
        var userId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        await using (var arrangeContext = CreateContext(databaseName))
        {
            arrangeContext.Users.Add(CreateUser(userId, now));
            await arrangeContext.SaveChangesAsync();
        }

        await using (var actContext = CreateContext(databaseName))
        {
            var repository = new IdentityRepository(actContext);
            var user = await repository.FindUserByNormalizedEmailAsync("ADMIN@EXAMPLE.COM", CancellationToken.None);
            Assert.NotNull(user);

            user.AddRefreshToken(new RefreshToken(
                tokenId,
                userId,
                new string('A', 64),
                now.AddDays(14),
                now,
                "127.0.0.1",
                "test-agent"));

            actContext.ChangeTracker.DetectChanges();
            Assert.Equal(EntityState.Added, actContext.Entry(user.RefreshTokens.Single()).State);

            await repository.SaveChangesAsync(CancellationToken.None);
        }

        await using var assertContext = CreateContext(databaseName);
        var persistedToken = await assertContext.RefreshTokens.SingleAsync(token => token.Id == tokenId);
        Assert.Equal(userId, persistedToken.UserId);
        Assert.Equal(new string('A', 64), persistedToken.TokenHash);
    }

    private static TheDomainDbContext CreateContext(string databaseName) =>
        new(new DbContextOptionsBuilder<TheDomainDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options);

    private static ApplicationUser CreateUser(Guid id, DateTimeOffset now) =>
        new(id, "Admin", "admin@example.com", "ADMIN@EXAMPLE.COM", "password-hash", UserRole.Admin, now);
}
