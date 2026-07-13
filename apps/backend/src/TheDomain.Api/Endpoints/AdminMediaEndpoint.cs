using Microsoft.AspNetCore.Mvc;
using TheDomain.Api.Authorization;
using TheDomain.Application.Events;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Media;

namespace TheDomain.Api.Endpoints;

public static class AdminMediaEndpoint
{
    public static IEndpointRouteBuilder MapAdminMediaEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/media").WithTags("Admin Media").RequireAuthorization(AuthorizationPolicies.MediaManagerOrAbove);
        group.MapGet("/", ([AsParameters] MediaListQuery query, IMediaQueryService service, CancellationToken token) => service.GetAsync(query, token));
        group.MapGet("/{id:guid}", async (Guid id, IMediaQueryService service, CancellationToken token) => await service.GetByIdAsync(id, token) is { } item ? Results.Ok(item) : Results.NotFound(Problem("Media asset was not found.", 404)));
        group.MapPost("/upload", UploadAsync).WithMetadata(new RequestSizeLimitAttribute(512L * 1024L * 1024L));
        group.MapPut("/{id:guid}/metadata", async (Guid id, UpdateMediaMetadataRequest request, IMediaManagementService service, CancellationToken token) => ToResult(await service.UpdateMetadataAsync(id, request, token)));
        group.MapPost("/{id:guid}/approve", async (Guid id, IMediaManagementService service, CancellationToken token) => ToResult(await service.ApproveAsync(id, token)));
        group.MapPost("/{id:guid}/hide", async (Guid id, IMediaManagementService service, CancellationToken token) => ToResult(await service.HideAsync(id, token)));
        group.MapDelete("/{id:guid}", async (Guid id, IMediaManagementService service, CancellationToken token) => ToResult(await service.HideAsync(id, token)));
        return endpoints;
    }

    private static async Task<IResult> UploadAsync(HttpRequest request, [FromServices] IMediaManagementService service, CancellationToken token)
    {
        if (!request.HasFormContentType) return Results.BadRequest(Problem("Multipart form data is required.", 400));
        var form = await request.ReadFormAsync(token); var file = form.Files.GetFile("file");
        if (file is null) return Results.BadRequest(Problem("A file is required.", 400));
        if (!Enum.TryParse<MediaApprovalStatus>(form["approvalStatus"], true, out var approval)) approval = MediaApprovalStatus.Draft;
        Guid? eventId = Guid.TryParse(form["eventId"], out var parsedEvent) ? parsedEvent : null;
        EventMediaUsage? usage = Enum.TryParse<EventMediaUsage>(form["usage"], true, out var parsedUsage) ? parsedUsage : null;
        var sortOrder = int.TryParse(form["sortOrder"], out var parsedOrder) ? parsedOrder : 0;
        var featured = bool.TryParse(form["isFeatured"], out var parsedFeatured) && parsedFeatured;
        await using var stream = file.OpenReadStream();
        var command = new UploadMediaCommand(stream, file.Length, file.FileName, file.ContentType, form["category"], form["caption"], form["altText"], approval, eventId, usage, sortOrder, featured);
        return ToResult(await service.UploadAsync(command, token));
    }

    private static IResult ToResult<T>(EventOperationResult<T> result) => result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(Problem(string.Join(" ", result.Errors), 400));
    private static ProblemDetails Problem(string detail, int status) => new() { Status = status, Title = "Media operation failed.", Detail = detail, Type = $"https://httpstatuses.com/{status}" };
}
