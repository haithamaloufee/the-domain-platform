using TheDomain.Domain.Identity;

namespace TheDomain.Application.Authentication;

public interface IPasswordHasher
{
    string HashPassword(ApplicationUser user, string password);
    bool VerifyPassword(ApplicationUser user, string passwordHash, string password);
}
