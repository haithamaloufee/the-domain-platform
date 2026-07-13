using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using TheDomain.Domain.Identity;
using TheDomain.Infrastructure.Authentication;

namespace TheDomain.Infrastructure.Tests.Authentication;

public sealed class JwtTokenServiceTests
{
    [Fact]
    public void CreateAccessTokenIncludesExpectedClaims()
    {
        var settings = Options.Create(new JwtOptions
        {
            Enabled = true,
            Issuer = "tests",
            Audience = "tests-client",
            SigningKey = "a-test-signing-key-that-is-at-least-32-bytes-long",
            AccessTokenLifetimeMinutes = 15
        });
        var user = new ApplicationUser(Guid.NewGuid(), "Test Admin", "admin@example.com", "ADMIN@EXAMPLE.COM", "hash", UserRole.Admin, DateTimeOffset.UtcNow);
        var service = new JwtTokenService(settings, TimeProvider.System);

        var result = service.CreateAccessToken(user);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(result.Token);

        Assert.Equal(user.Id.ToString(), token.Subject);
        Assert.Contains(token.Claims, claim => claim.Type == JwtRegisteredClaimNames.Email && claim.Value == user.Email);
        Assert.Contains(token.Claims, claim => claim.Type == ClaimTypes.Role && claim.Value == UserRole.Admin.ToString());
        Assert.Contains(token.Claims, claim => claim.Type == JwtRegisteredClaimNames.Jti);
    }
}
