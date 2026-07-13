using Microsoft.AspNetCore.Mvc;
using TheDomain.Api.Authorization;
using TheDomain.Application.Events;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Api.Endpoints;

public static class AdminEventMediaEndpoint
{
    public static IEndpointRouteBuilder MapAdminEventMediaEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/events/{eventId:guid}/media").WithTags("Admin Event Media").RequireAuthorization(AuthorizationPolicies.MediaManagerOrAbove);
        group.MapGet("/", async (Guid eventId, IMediaQueryService service, CancellationToken token) => Results.Ok(await service.GetEventMediaAsync(eventId, token)));
        group.MapPost("/", async (Guid eventId, AssignEventMediaRequest request, IMediaManagementService service, CancellationToken token) => ToResult(await service.AssignAsync(eventId, request, token)));
        group.MapPut("/{eventMediaId:guid}", async (Guid eventId, Guid eventMediaId, UpdateEventMediaRequest request, IMediaManagementService service, CancellationToken token) => ToResult(await service.UpdateAssignmentAsync(eventId, eventMediaId, request, token)));
        group.MapDelete("/{eventMediaId:guid}", async (Guid eventId, Guid eventMediaId, IMediaManagementService service, CancellationToken token) => await service.RemoveAssignmentAsync(eventId, eventMediaId, token) ? Results.NoContent() : Results.NotFound(Problem("Event media assignment was not found.", 404)));
        return endpoints;
    }
    private static IResult ToResult<T>(EventOperationResult<T> result) => result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(Problem(string.Join(" ", result.Errors), 400));
    private static ProblemDetails Problem(string detail, int status) => new() { Status = status, Title = "Event media operation failed.", Detail = detail, Type = $"https://httpstatuses.com/{status}" };
}
