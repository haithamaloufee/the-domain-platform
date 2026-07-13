using TheDomain.Domain.Identity;

namespace TheDomain.Application.Authentication;

public interface IJwtTokenService
{
    AccessTokenResult CreateAccessToken(ApplicationUser user);
}

public sealed record AccessTokenResult(string Token, DateTimeOffset ExpiresAtUtc);
