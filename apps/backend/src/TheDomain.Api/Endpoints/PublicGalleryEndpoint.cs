using Microsoft.AspNetCore.Http.HttpResults;
using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Application.Caching;
namespace TheDomain.Api.Endpoints;
public static class PublicGalleryEndpoint
{
    public static IEndpointRouteBuilder MapPublicGalleryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/public/gallery/collections").WithTags("Public Gallery Collections").AllowAnonymous();
        group.MapGet("/", (IGalleryService service, CancellationToken token) => service.GetPublicAsync(token)).CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(1)).Tag(PublicCacheTags.Gallery, PublicCacheTags.Media));
        group.MapGet("/{id:guid}", async Task<Results<Ok<GalleryPublicCollectionResponse>, NotFound>> (Guid id, IGalleryService service, CancellationToken token) => await service.GetPublicByIdAsync(id, token) is { } item ? TypedResults.Ok(item) : TypedResults.NotFound()).CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(1)).Tag(PublicCacheTags.Gallery, PublicCacheTags.Media));
        return endpoints;
    }
}
