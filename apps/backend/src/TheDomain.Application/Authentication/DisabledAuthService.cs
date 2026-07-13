using TheDomain.Application.Authentication.Contracts;

namespace TheDomain.Application.Authentication;

public sealed class DisabledAuthService : IAuthService
{
    private const string DisabledMessage = "Authentication is not available.";

    public Task<AuthenticationResult> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken) =>
        Task.FromResult(AuthenticationResult.Failure(DisabledMessage));

    public Task<AuthenticationResult> RefreshAsync(RefreshRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken) =>
        Task.FromResult(AuthenticationResult.Failure(DisabledMessage));

    public Task<bool> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken) => Task.FromResult(false);
}
