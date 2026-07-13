using TheDomain.Application.Authentication;
using TheDomain.Application.Authentication.Contracts;
using TheDomain.Domain.Identity;

namespace TheDomain.Application.Tests.Authentication;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task LoginPersistsHashedRefreshTokenAndReturnsRawToken()
    {
        var now = DateTimeOffset.UtcNow;
        var user = new ApplicationUser(Guid.NewGuid(), "Admin", "admin@example.com", "ADMIN@EXAMPLE.COM", "hash", UserRole.Admin, now);
        var repository = new FakeIdentityRepository { User = user };
        var service = CreateService(repository, passwordIsValid: true);

        var result = await service.LoginAsync(new LoginRequest(" admin@example.com ", "valid"), "127.0.0.1", "test-agent", CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("raw", result.Value.RefreshToken);
        Assert.Equal(1, repository.SaveCount);
        var persistedToken = Assert.Single(user.RefreshTokens);
        Assert.Equal("new-hash", persistedToken.TokenHash);
        Assert.NotEqual(result.Value.RefreshToken, persistedToken.TokenHash);
        Assert.Equal("127.0.0.1", persistedToken.CreatedByIp);
        Assert.Equal("test-agent", persistedToken.UserAgent);
        Assert.NotNull(user.LastLoginAtUtc);
    }

    [Fact]
    public async Task LoginRejectsInvalidCredentials()
    {
        var repository = new FakeIdentityRepository();
        var service = CreateService(repository);

        var result = await service.LoginAsync(new LoginRequest("missing@example.com", "wrong"), null, null, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid email or password.", result.Error);
    }

    [Fact]
    public async Task RefreshRejectsRevokedToken()
    {
        var now = DateTimeOffset.UtcNow;
        var user = new ApplicationUser(Guid.NewGuid(), "Admin", "admin@example.com", "ADMIN@EXAMPLE.COM", "hash", UserRole.Admin, now);
        var token = new RefreshToken(Guid.NewGuid(), user.Id, "presented-hash", now.AddDays(1), now, null, null);
        token.Revoke(now);
        user.AddRefreshToken(token);
        var repository = new FakeIdentityRepository { RefreshToken = token };
        var service = CreateService(repository);

        var result = await service.RefreshAsync(new RefreshRequest("presented"), null, null, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("The refresh token is invalid or expired.", result.Error);
        Assert.Equal(0, repository.SaveCount);
    }

    private static AuthService CreateService(FakeIdentityRepository repository, bool passwordIsValid = false) =>
        new(repository, new FakePasswordHasher(passwordIsValid), new FakeJwtTokenService(), new FakeRefreshTokenService(), TimeProvider.System);

    private sealed class FakeIdentityRepository : IIdentityRepository
    {
        public RefreshToken? RefreshToken { get; init; }
        public ApplicationUser? User { get; init; }
        public int SaveCount { get; private set; }
        public Task<ApplicationUser?> FindUserByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken) => Task.FromResult(User);
        public Task<RefreshToken?> FindRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken) => Task.FromResult(RefreshToken);
        public Task<bool> HasUsersAsync(CancellationToken cancellationToken) => Task.FromResult(false);
        public void AddUser(ApplicationUser user) { }
        public Task SaveChangesAsync(CancellationToken cancellationToken) { SaveCount++; return Task.CompletedTask; }
    }

    private sealed class FakePasswordHasher(bool passwordIsValid) : IPasswordHasher
    {
        public string HashPassword(ApplicationUser user, string password) => "hash";
        public bool VerifyPassword(ApplicationUser user, string passwordHash, string password) => passwordIsValid;
    }

    private sealed class FakeJwtTokenService : IJwtTokenService
    {
        public AccessTokenResult CreateAccessToken(ApplicationUser user) => new("access", DateTimeOffset.UtcNow.AddMinutes(15));
    }

    private sealed class FakeRefreshTokenService : IRefreshTokenService
    {
        public TimeSpan Lifetime => TimeSpan.FromDays(14);
        public GeneratedRefreshToken Generate() => new("raw", "new-hash");
        public string Hash(string token) => $"{token}-hash";
    }
}
