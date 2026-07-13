using TheDomain.Application.Authentication.Contracts;

namespace TheDomain.Application.Authentication;

public sealed record AuthenticationResult(AuthTokensResponse? Value, string? Error)
{
    public bool IsSuccess => Value is not null;

    public static AuthenticationResult Success(AuthTokensResponse value) => new(value, null);
    public static AuthenticationResult Failure(string error) => new(null, error);
}
