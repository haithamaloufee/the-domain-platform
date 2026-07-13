using TheDomain.Application.Authentication.Contracts;

namespace TheDomain.Application.Authentication;

public interface IAuthService
{
    Task<AuthenticationResult> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken);
    Task<AuthenticationResult> RefreshAsync(RefreshRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken);
    Task<bool> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken);
}
