using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TheDomain.Api.Authorization;
using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;

namespace TheDomain.Api.Endpoints;

public static class AdminEventEndpoint
{
    public static IEndpointRouteBuilder MapAdminEventEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/events").WithTags("Admin Events").RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess);
        group.MapGet("/", (IEventService service, CancellationToken token) => service.GetAdminEventsAsync(token));
        group.MapGet("/{id:guid}", GetAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapPost("/{id:guid}/publish", (Guid id, IEventService service, CancellationToken token) => ChangeStatusAsync(service.PublishAsync(id, token)));
        group.MapPost("/{id:guid}/archive", (Guid id, IEventService service, CancellationToken token) => ChangeStatusAsync(service.ArchiveAsync(id, token)));
        group.MapPost("/{id:guid}/cancel", (Guid id, IEventService service, CancellationToken token) => ChangeStatusAsync(service.CancelAsync(id, token)));
        return endpoints;
    }

    private static async Task<Results<Ok<AdminEventResponse>, NotFound<ProblemDetails>>> GetAsync(Guid id, [FromServices] IEventService service, CancellationToken token)
    { var item = await service.GetAdminByIdAsync(id, token); return item is null ? TypedResults.NotFound(Problem("Event was not found.", 404)) : TypedResults.Ok(item); }
    private static async Task<Results<Created<AdminEventResponse>, BadRequest<ProblemDetails>>> CreateAsync(SaveEventRequest request, [FromServices] IEventService service, CancellationToken token)
    { var result = await service.CreateAsync(request, token); return result.IsSuccess ? TypedResults.Created($"/api/admin/events/{result.Value!.Id}", result.Value) : TypedResults.BadRequest(Problem(string.Join(" ", result.Errors), 400)); }
    private static async Task<Results<Ok<AdminEventResponse>, BadRequest<ProblemDetails>>> UpdateAsync(Guid id, SaveEventRequest request, [FromServices] IEventService service, CancellationToken token)
    { var result = await service.UpdateAsync(id, request, token); return result.IsSuccess ? TypedResults.Ok(result.Value!) : TypedResults.BadRequest(Problem(string.Join(" ", result.Errors), 400)); }
    private static async Task<Results<Ok<AdminEventResponse>, BadRequest<ProblemDetails>>> ChangeStatusAsync(Task<EventOperationResult<AdminEventResponse>> operation)
    { var result = await operation; return result.IsSuccess ? TypedResults.Ok(result.Value!) : TypedResults.BadRequest(Problem(string.Join(" ", result.Errors), 400)); }
    private static ProblemDetails Problem(string detail, int status) => new() { Status = status, Title = "Event operation failed.", Detail = detail, Type = $"https://httpstatuses.com/{status}" };
}
