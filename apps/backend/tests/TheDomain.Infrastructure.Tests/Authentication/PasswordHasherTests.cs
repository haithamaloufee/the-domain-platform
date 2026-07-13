using TheDomain.Domain.Identity;
using TheDomain.Infrastructure.Authentication;

namespace TheDomain.Infrastructure.Tests.Authentication;

public sealed class PasswordHasherTests
{
    private static readonly ApplicationUser User = new(Guid.NewGuid(), "Admin", "admin@example.com", "ADMIN@EXAMPLE.COM", "pending", UserRole.SuperAdmin, DateTimeOffset.UtcNow);

    [Fact]
    public void VerifyPasswordAcceptsValidPassword()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword(User, "Valid-Password-123!");
        Assert.True(hasher.VerifyPassword(User, hash, "Valid-Password-123!"));
    }

    [Fact]
    public void VerifyPasswordRejectsInvalidPassword()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword(User, "Valid-Password-123!");
        Assert.False(hasher.VerifyPassword(User, hash, "Wrong-Password-123!"));
    }
}
