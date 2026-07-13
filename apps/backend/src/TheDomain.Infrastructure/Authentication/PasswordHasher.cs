using Microsoft.AspNetCore.Identity;
using TheDomain.Application.Authentication;
using TheDomain.Domain.Identity;

namespace TheDomain.Infrastructure.Authentication;

public sealed class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<ApplicationUser> _hasher = new();

    public string HashPassword(ApplicationUser user, string password) => _hasher.HashPassword(user, password);

    public bool VerifyPassword(ApplicationUser user, string passwordHash, string password) =>
        _hasher.VerifyHashedPassword(user, passwordHash, password) is not PasswordVerificationResult.Failed;
}
