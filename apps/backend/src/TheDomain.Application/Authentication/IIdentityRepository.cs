using TheDomain.Domain.Identity;

namespace TheDomain.Application.Authentication;

public interface IIdentityRepository
{
    Task<ApplicationUser?> FindUserByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken);
    Task<RefreshToken?> FindRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken);
    Task<bool> HasUsersAsync(CancellationToken cancellationToken);
    void AddUser(ApplicationUser user);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
