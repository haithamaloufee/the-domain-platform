using TheDomain.Application.Authentication.Contracts;
using TheDomain.Application.Common;
using TheDomain.Domain.Identity;

namespace TheDomain.Application.Authentication;

public sealed class AuthService(
    IIdentityRepository repository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IRefreshTokenService refreshTokenService,
    TimeProvider timeProvider) : IAuthService
{
    private const string InvalidCredentials = "Invalid email or password.";
    private const string InvalidRefreshToken = "The refresh token is invalid or expired.";

    public async Task<AuthenticationResult> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken)
    {
        var user = await repository.FindUserByNormalizedEmailAsync(EmailNormalizer.Normalize(request.Email), cancellationToken);
        if (user is null || !user.IsActive || !passwordHasher.VerifyPassword(user, user.PasswordHash, request.Password))
        {
            return AuthenticationResult.Failure(InvalidCredentials);
        }

        var now = timeProvider.GetUtcNow();
        user.RecordLogin(now);
        var response = IssueTokens(user, now, ipAddress, userAgent);
        await repository.SaveChangesAsync(cancellationToken);
        return AuthenticationResult.Success(response);
    }

    public async Task<AuthenticationResult> RefreshAsync(RefreshRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken)
    {
        var token = await repository.FindRefreshTokenAsync(refreshTokenService.Hash(request.RefreshToken), cancellationToken);
        var now = timeProvider.GetUtcNow();
        if (token is null || !token.IsActive(now) || !token.User.IsActive)
        {
            return AuthenticationResult.Failure(InvalidRefreshToken);
        }

        var replacement = refreshTokenService.Generate();
        token.Revoke(now, replacement.TokenHash);
        token.User.AddRefreshToken(CreateRefreshToken(token.User.Id, replacement, now, ipAddress, userAgent));
        var accessToken = jwtTokenService.CreateAccessToken(token.User);
        await repository.SaveChangesAsync(cancellationToken);

        return AuthenticationResult.Success(CreateResponse(token.User, accessToken, replacement.RawToken));
    }

    public async Task<bool> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken)
    {
        var token = await repository.FindRefreshTokenAsync(refreshTokenService.Hash(request.RefreshToken), cancellationToken);
        if (token is null || !token.IsActive(timeProvider.GetUtcNow()))
        {
            return false;
        }

        token.Revoke(timeProvider.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private AuthTokensResponse IssueTokens(ApplicationUser user, DateTimeOffset now, string? ipAddress, string? userAgent)
    {
        var refresh = refreshTokenService.Generate();
        user.AddRefreshToken(CreateRefreshToken(user.Id, refresh, now, ipAddress, userAgent));
        return CreateResponse(user, jwtTokenService.CreateAccessToken(user), refresh.RawToken);
    }

    private RefreshToken CreateRefreshToken(Guid userId, GeneratedRefreshToken token, DateTimeOffset now, string? ipAddress, string? userAgent) =>
        new(Guid.NewGuid(), userId, token.TokenHash, now.Add(refreshTokenService.Lifetime), now, ipAddress, userAgent);

    private static AuthTokensResponse CreateResponse(ApplicationUser user, AccessTokenResult accessToken, string refreshToken) =>
        new(accessToken.Token, refreshToken, accessToken.ExpiresAtUtc, new AuthenticatedUserResponse(user.Id, user.FullName, user.Email, user.Role));
}
