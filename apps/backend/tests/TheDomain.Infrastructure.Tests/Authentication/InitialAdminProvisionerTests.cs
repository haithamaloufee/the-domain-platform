using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using TheDomain.Application.Authentication;
using TheDomain.Application.Common;
using TheDomain.Domain.Identity;
using TheDomain.Infrastructure.Authentication;

namespace TheDomain.Infrastructure.Tests.Authentication;

public sealed class InitialAdminProvisionerTests
{
    private static readonly DateTimeOffset Now = new(2026, 7, 14, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task DevelopmentResetUpdatesPasswordAndRevokesRefreshTokens()
    {
        var hasher = new PasswordHasher();
        var user = CreateUser(hasher, "Old-password-123!");
        var token = new RefreshToken(Guid.NewGuid(), user.Id, new string('A', 64), Now.AddDays(1), Now.AddDays(-1), null, null);
        user.AddRefreshToken(token);
        var repository = new FakeIdentityRepository(user);

        await CreateProvisioner(repository, hasher, Environments.Development, resetExistingPassword: true).StartAsync(CancellationToken.None);

        Assert.True(hasher.VerifyPassword(user, user.PasswordHash, "New-password-123!"));
        Assert.False(token.IsActive(Now));
        Assert.Equal(1, repository.SaveCount);
    }

    [Fact]
    public async Task ExistingPasswordIsNotChangedWhenResetIsDisabled()
    {
        var hasher = new PasswordHasher();
        var user = CreateUser(hasher, "Old-password-123!");
        var originalHash = user.PasswordHash;
        var repository = new FakeIdentityRepository(user);

        await CreateProvisioner(repository, hasher, Environments.Development, resetExistingPassword: false).StartAsync(CancellationToken.None);

        Assert.Equal(originalHash, user.PasswordHash);
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task ResetIsRejectedOutsideDevelopment()
    {
        var hasher = new PasswordHasher();
        var repository = new FakeIdentityRepository(CreateUser(hasher, "Old-password-123!"));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateProvisioner(repository, hasher, Environments.Production, resetExistingPassword: true).StartAsync(CancellationToken.None));

        Assert.Contains("only in Development", exception.Message, StringComparison.Ordinal);
        Assert.Equal(0, repository.SaveCount);
    }

    private static InitialAdminProvisioner CreateProvisioner(
        FakeIdentityRepository repository,
        PasswordHasher hasher,
        string environment,
        bool resetExistingPassword)
    {
        var services = new ServiceCollection()
            .AddSingleton<IIdentityRepository>(repository)
            .AddSingleton<IPasswordHasher>(hasher)
            .BuildServiceProvider();

        var options = Options.Create(new InitialAdminOptions
        {
            Enabled = true,
            ResetExistingPassword = resetExistingPassword,
            Email = "admin@example.com",
            Password = "New-password-123!",
            FullName = "Domain Admin"
        });

        return new InitialAdminProvisioner(
            services.GetRequiredService<IServiceScopeFactory>(),
            options,
            new FakeHostEnvironment(environment),
            new FixedTimeProvider(Now));
    }

    private static ApplicationUser CreateUser(PasswordHasher hasher, string password)
    {
        var user = new ApplicationUser(Guid.NewGuid(), "Domain Admin", "admin@example.com", EmailNormalizer.Normalize("admin@example.com"), "pending", UserRole.SuperAdmin, Now.AddDays(-2));
        user.ResetPassword(hasher.HashPassword(user, password), Now.AddDays(-2));
        return user;
    }

    private sealed class FakeIdentityRepository(ApplicationUser? user) : IIdentityRepository
    {
        public int SaveCount { get; private set; }
        public Task<ApplicationUser?> FindUserByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
            Task.FromResult(user?.NormalizedEmail == normalizedEmail ? user : null);
        public Task<RefreshToken?> FindRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken) => Task.FromResult<RefreshToken?>(null);
        public Task<bool> HasUsersAsync(CancellationToken cancellationToken) => Task.FromResult(user is not null);
        public void AddUser(ApplicationUser addedUser) => user = addedUser;
        public Task SaveChangesAsync(CancellationToken cancellationToken) { SaveCount++; return Task.CompletedTask; }
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class FakeHostEnvironment(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;
        public string ApplicationName { get; set; } = "TheDomain.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
