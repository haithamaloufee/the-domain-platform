using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using TheDomain.Application.Authentication;
using TheDomain.Application.Common;
using TheDomain.Domain.Identity;

namespace TheDomain.Infrastructure.Authentication;

public sealed class InitialAdminProvisioner(
    IServiceScopeFactory scopeFactory,
    IOptions<InitialAdminOptions> options,
    TimeProvider timeProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var settings = options.Value;
        Validate(settings);

        await using var scope = scopeFactory.CreateAsyncScope();
        var repository = scope.ServiceProvider.GetRequiredService<IIdentityRepository>();
        if (await repository.HasUsersAsync(cancellationToken))
        {
            return;
        }

        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var now = timeProvider.GetUtcNow();
        var temporaryUser = new ApplicationUser(Guid.NewGuid(), settings.FullName.Trim(), settings.Email.Trim(), EmailNormalizer.Normalize(settings.Email), "pending", UserRole.SuperAdmin, now);
        var passwordHash = hasher.HashPassword(temporaryUser, settings.Password);
        var user = new ApplicationUser(temporaryUser.Id, temporaryUser.FullName, temporaryUser.Email, temporaryUser.NormalizedEmail, passwordHash, UserRole.SuperAdmin, now);
        repository.AddUser(user);
        await repository.SaveChangesAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static void Validate(InitialAdminOptions settings)
    {
        if (string.IsNullOrWhiteSpace(settings.Email) || !settings.Email.Contains('@', StringComparison.Ordinal) || string.IsNullOrWhiteSpace(settings.FullName))
        {
            throw new InvalidOperationException("Initial admin email and full name are required.");
        }

        var password = settings.Password;
        if (password.Length < 12 || !password.Any(char.IsUpper) || !password.Any(char.IsLower) || !password.Any(char.IsDigit) || !password.Any(character => !char.IsLetterOrDigit(character)))
        {
            throw new InvalidOperationException("The initial admin password does not meet the required strength policy.");
        }
    }
}
