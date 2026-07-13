namespace TheDomain.Application.Authentication;

public interface IRefreshTokenService
{
    GeneratedRefreshToken Generate();
    string Hash(string token);
    TimeSpan Lifetime { get; }
}

public sealed record GeneratedRefreshToken(string RawToken, string TokenHash);
