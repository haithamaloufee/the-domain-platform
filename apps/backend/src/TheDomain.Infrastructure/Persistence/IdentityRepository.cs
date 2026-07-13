using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Authentication;
using TheDomain.Domain.Identity;

namespace TheDomain.Infrastructure.Persistence;

public sealed class IdentityRepository(TheDomainDbContext dbContext) : IIdentityRepository
{
    public Task<ApplicationUser?> FindUserByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        dbContext.Users.Include(user => user.RefreshTokens)
            .SingleOrDefaultAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);

    public Task<RefreshToken?> FindRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens.Include(token => token.User)
            .SingleOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

    public Task<bool> HasUsersAsync(CancellationToken cancellationToken) => dbContext.Users.AnyAsync(cancellationToken);
    public void AddUser(ApplicationUser user) => dbContext.Users.Add(user);
    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
}
