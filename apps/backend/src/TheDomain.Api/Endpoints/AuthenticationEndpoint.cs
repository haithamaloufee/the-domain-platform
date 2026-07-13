using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TheDomain.Application.Authentication;
using TheDomain.Application.Authentication.Contracts;
using TheDomain.Domain.Identity;

namespace TheDomain.Api.Endpoints;

public static class AuthenticationEndpoint
{
    public static IEndpointRouteBuilder MapAuthenticationEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/auth").WithTags("Authentication");
        group.MapPost("/login", LoginAsync).AllowAnonymous();
        group.MapPost("/refresh", RefreshAsync).AllowAnonymous();
        group.MapPost("/logout", LogoutAsync).AllowAnonymous();
        group.MapGet("/me", GetCurrentUser).RequireAuthorization();
        return endpoints;
    }

    private static async Task<Results<Ok<AuthTokensResponse>, BadRequest<ProblemDetails>, ProblemHttpResult>> LoginAsync(
        LoginRequest request, [FromServices] IAuthService authService, HttpContext context, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return TypedResults.BadRequest(CreateValidationProblem("Email and password are required."));
        }

        var result = await authService.LoginAsync(request, GetIp(context), GetUserAgent(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value!) : CreateAuthenticationProblem(result.Error!);
    }

    private static async Task<Results<Ok<AuthTokensResponse>, BadRequest<ProblemDetails>, ProblemHttpResult>> RefreshAsync(
        RefreshRequest request, [FromServices] IAuthService authService, HttpContext context, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return TypedResults.BadRequest(CreateValidationProblem("Refresh token is required."));
        }

        var result = await authService.RefreshAsync(request, GetIp(context), GetUserAgent(context), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value!) : CreateAuthenticationProblem(result.Error!);
    }

    private static async Task<Results<Ok<LogoutResponse>, BadRequest<ProblemDetails>, ProblemHttpResult>> LogoutAsync(
        LogoutRequest request, [FromServices] IAuthService authService, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return TypedResults.BadRequest(CreateValidationProblem("Refresh token is required."));
        }

        return await authService.LogoutAsync(request, cancellationToken)
            ? TypedResults.Ok(new LogoutResponse(true))
            : CreateAuthenticationProblem("The refresh token is invalid or expired.");
    }

    private static Results<Ok<AuthenticatedUserResponse>, UnauthorizedHttpResult> GetCurrentUser(ClaimsPrincipal principal)
    {
        var idValue = principal.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = principal.FindFirstValue(JwtRegisteredClaimNames.Email);
        var name = principal.FindFirstValue(ClaimTypes.Name);
        var roleValue = principal.FindFirstValue(ClaimTypes.Role);
        if (!Guid.TryParse(idValue, out var id) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(name) || !Enum.TryParse<UserRole>(roleValue, out var role))
        {
            return TypedResults.Unauthorized();
        }

        return TypedResults.Ok(new AuthenticatedUserResponse(id, name, email, role));
    }

    private static ProblemDetails CreateValidationProblem(string detail) => new()
    {
        Status = StatusCodes.Status400BadRequest,
        Title = "Validation failed.",
        Detail = detail,
        Type = "https://httpstatuses.com/400"
    };

    private static ProblemHttpResult CreateAuthenticationProblem(string detail) => TypedResults.Problem(
        statusCode: StatusCodes.Status401Unauthorized,
        title: "Authentication failed.",
        detail: detail,
        type: "https://httpstatuses.com/401");

    private static string? GetIp(HttpContext context) => context.Connection.RemoteIpAddress?.ToString();
    private static string? GetUserAgent(HttpContext context) => context.Request.Headers.UserAgent.ToString() is { Length: > 0 } value ? value[..Math.Min(value.Length, 512)] : null;
}
