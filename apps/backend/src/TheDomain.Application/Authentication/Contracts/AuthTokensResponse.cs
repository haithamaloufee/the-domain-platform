namespace TheDomain.Application.Authentication.Contracts;

public sealed record AuthTokensResponse(
    string AccessToken,
    string RefreshToken,
    DateTimeOffset ExpiresAtUtc,
    AuthenticatedUserResponse User);
