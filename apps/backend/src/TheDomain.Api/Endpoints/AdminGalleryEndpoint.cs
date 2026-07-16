using TheDomain.Api.Authorization;
using TheDomain.Application.Events;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
namespace TheDomain.Api.Endpoints;
public static class AdminGalleryEndpoint
{
    public static IEndpointRouteBuilder MapAdminGalleryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/gallery").WithTags("Admin Gallery").RequireAuthorization(AuthorizationPolicies.MediaManagerOrAbove);
        group.MapGet("/", (IGalleryService service, CancellationToken token) => service.GetAdminAsync(token));
        group.MapPost("/collections/{id:guid}/publish", async (Guid id, IGalleryService service, CancellationToken token) => Result(await service.PublishAsync(id, token)));
        group.MapPost("/collections/{id:guid}/unpublish", async (Guid id, IGalleryService service, CancellationToken token) => Result(await service.UnpublishAsync(id, token)));
        group.MapPost("/reorder", async (ReorderGalleryCollectionsRequest request, IGalleryService service, CancellationToken token) => Result(await service.ReorderAsync(request, token)));
        group.MapPut("/collections/{id:guid}/presentation", async (Guid id, SaveGalleryCollectionPresentationRequest request, IGalleryService service, CancellationToken token) => Result(await service.SavePresentationAsync(id, request, token)));
        group.MapPost("/collections/{id:guid}/reset", async (Guid id, IGalleryService service, CancellationToken token) => Result(await service.ResetPresentationAsync(id, token)));
        return endpoints;
    }
    private static IResult Result<T>(EventOperationResult<T> result) { if (result.IsSuccess) return Results.Ok(result.Value); var status = result.FailureKind == EventFailureKind.NotFound ? 404 : result.FailureKind == EventFailureKind.Conflict ? 409 : 400; return Results.Problem(statusCode: status, title: "Gallery operation failed.", detail: string.Join(" ", result.Errors)); }
}
