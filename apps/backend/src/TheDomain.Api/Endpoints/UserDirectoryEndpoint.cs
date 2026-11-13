using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TheDomain.Api.Authorization;
using TheDomain.Application.Authentication;

namespace TheDomain.Api.Endpoints;

public static class UserDirectoryEndpoint
{
    public static void MapUserDirectoryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var users = endpoints.MapGroup("/api/admin/users").RequireAuthorization(AuthorizationPolicies.SuperAdminOnly);
        users.MapGet("/", ListAsync);
        users.MapPost("/", CreateAsync);
        users.MapPut("/{id:guid}", UpdateAsync);
    }

    private static async Task<IResult> ListAsync(int? offset, HttpContext context, CancellationToken token)
    {
        if (context.RequestServices.GetService<IUserDirectory>() is not { } directory) return Unavailable();
        return Results.Ok(await directory.ListAsync(Math.Clamp(offset ?? 0, 0, 100_000), token));
    }

    private static async Task<IResult> CreateAsync(CreateManagedUser request, HttpContext context, CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length > 120 ||
            string.IsNullOrWhiteSpace(request.Email) || request.Email.Trim().Length > 254 ||
            !new EmailAddressAttribute().IsValid(request.Email.Trim()) ||
            string.IsNullOrWhiteSpace(request.Password) || request.Password.Length is < 12 or > 1024 ||
            !Enum.IsDefined(request.Role))
            return Results.Problem("Provide a valid name, email, role and password of at least 12 characters.", statusCode: 400);

        if (context.RequestServices.GetService<IUserDirectory>() is not { } directory) return Unavailable();
        return Map(await directory.CreateAsync(request, token));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateManagedUser request, ClaimsPrincipal actor, HttpContext context, CancellationToken token)
    {
        if (!Guid.TryParse(actor.FindFirstValue(JwtRegisteredClaimNames.Sub), out var actorId)) return Results.Unauthorized();
        if (!Enum.IsDefined(request.Role)) return Results.Problem("Choose a supported role.", statusCode: 400);
        if (context.RequestServices.GetService<IUserDirectory>() is not { } directory) return Unavailable();
        return Map(await directory.UpdateAsync(id, actorId, request, token));
    }

    private static IResult Map(UserDirectoryResult result) => result switch
    {
        UserDirectoryResult.Saved => Results.NoContent(),
        UserDirectoryResult.NotFound => Results.NotFound(),
        _ => Results.Problem("This change conflicts with an existing account or would remove required administrator access.", statusCode: 409)
    };

    private static IResult Unavailable() => Results.Problem("The user directory is temporarily unavailable.", statusCode: 503);
}
