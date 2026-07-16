using Microsoft.AspNetCore.Mvc;
using TheDomain.Api.Authorization;
using TheDomain.Application.Events;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;

namespace TheDomain.Api.Endpoints;

public static class AdminMediaCollectionEndpoint
{
    public static IEndpointRouteBuilder MapAdminMediaCollectionEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/media-collections").WithTags("Admin Media Collections")
            .RequireAuthorization(AuthorizationPolicies.MediaManagerOrAbove);
        group.MapGet("/", (bool includeArchived, IMediaOrganizationService service, CancellationToken token) => service.ListCollectionsAsync(includeArchived, token));
        group.MapPost("/", async (SaveMediaCollectionRequest request, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.CreateCollectionAsync(request, token)));
        group.MapGet("/{id:guid}/items", async (Guid id, IMediaOrganizationService service, CancellationToken token) => await service.GetCollectionItemsAsync(id, token) is { } items ? Results.Ok(items) : Results.NotFound());
        group.MapPut("/{id:guid}", async (Guid id, SaveMediaCollectionRequest request, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.RenameCollectionAsync(id, request, token)));
        group.MapPost("/{id:guid}/archive", async (Guid id, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.ArchiveCollectionAsync(id, token)));
        group.MapPost("/{id:guid}/restore", async (Guid id, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.RestoreCollectionAsync(id, token)));
        group.MapDelete("/{id:guid}", async (Guid id, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.DeleteCollectionAsync(id, token)));
        group.MapPost("/{id:guid}/items", async (Guid id, AddMediaToCollectionRequest request, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.AddToCollectionAsync(id, request, token)));
        group.MapDelete("/{id:guid}/items/{mediaAssetId:guid}", async (Guid id, Guid mediaAssetId, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.RemoveFromCollectionAsync(id, mediaAssetId, token)));
        group.MapPost("/{id:guid}/reorder", async (Guid id, ReorderMediaCollectionRequest request, IMediaOrganizationService service, CancellationToken token) => ToResult(await service.ReorderCollectionAsync(id, request, token)));
        return endpoints;
    }
    private static IResult ToResult<T>(EventOperationResult<T> result)
    {
        if (result.IsSuccess) return Results.Ok(result.Value);
        var status = result.FailureKind == EventFailureKind.NotFound ? 404 : result.FailureKind == EventFailureKind.Conflict ? 409 : 400;
        return Results.Problem(statusCode: status, title: "Media collection operation failed.", detail: string.Join(" ", result.Errors));
    }
}
