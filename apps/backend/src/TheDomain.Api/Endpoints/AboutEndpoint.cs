using TheDomain.Api.Authorization;
using TheDomain.Application.About;
using TheDomain.Application.Homepage;
using TheDomain.Application.Caching;

namespace TheDomain.Api.Endpoints;

public static class AboutEndpoint
{
    public static IEndpointRouteBuilder MapAboutEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/public/about", (IAboutService service, CancellationToken token) => service.GetPublicAboutAsync(token)).AllowAnonymous().WithTags("Public About").CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(1)).Tag(PublicCacheTags.About, PublicCacheTags.Partners, PublicCacheTags.Media));
        var about = endpoints.MapGroup("/api/admin/about").RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess).WithTags("Admin About");
        about.MapGet("/", (IAboutService service, CancellationToken token) => service.GetAdminSettingsAsync(token));
        about.MapPut("/", async (SaveAboutSettingsRequest request, IAboutService service, CancellationToken token) => Result(await service.SaveSettingsAsync(request, token)));
        var team = endpoints.MapGroup("/api/admin/team").RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess).WithTags("Admin Team");
        team.MapGet("/", (IAboutService service, CancellationToken token) => service.ListAdminTeamAsync(token));
        team.MapPost("/", async (SaveTeamMemberRequest request, IAboutService service, CancellationToken token) => Result(await service.CreateTeamMemberAsync(request, token), true));
        team.MapPut("/{id:guid}", async (Guid id, SaveTeamMemberRequest request, IAboutService service, CancellationToken token) => Result(await service.UpdateTeamMemberAsync(id, request, token)));
        team.MapPost("/{id:guid}/show", async (Guid id, IAboutService service, CancellationToken token) => Result(await service.SetTeamVisibilityAsync(id, true, token)));
        team.MapPost("/{id:guid}/hide", async (Guid id, IAboutService service, CancellationToken token) => Result(await service.SetTeamVisibilityAsync(id, false, token)));
        team.MapPost("/reorder", async (ReorderTeamRequest request, IAboutService service, CancellationToken token) => Result(await service.ReorderTeamAsync(request, token)));
        team.MapDelete("/{id:guid}", async (Guid id, IAboutService service, CancellationToken token) => Result(await service.DeleteTeamMemberAsync(id, token)));
        return endpoints;
    }
    private static IResult Result<T>(CmsOperationResult<T> result, bool created = false)
    { if (result.IsSuccess) return created ? Results.Json(result.Value, statusCode: StatusCodes.Status201Created) : Results.Ok(result.Value); var status = result.FailureKind == CmsFailureKind.NotFound ? 404 : result.FailureKind == CmsFailureKind.Conflict ? 409 : 400; return Results.Problem(statusCode: status, title: "About operation failed.", detail: string.Join(" ", result.Errors)); }
}
