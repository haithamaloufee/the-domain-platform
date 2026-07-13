using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using TheDomain.Application.Authentication;

namespace TheDomain.Infrastructure.Authentication;

public sealed class RefreshTokenService(IOptions<JwtOptions> options) : IRefreshTokenService
{
    public TimeSpan Lifetime => TimeSpan.FromDays(options.Value.RefreshTokenLifetimeDays);

    public GeneratedRefreshToken Generate()
    {
        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        return new GeneratedRefreshToken(rawToken, Hash(rawToken));
    }

    public string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
