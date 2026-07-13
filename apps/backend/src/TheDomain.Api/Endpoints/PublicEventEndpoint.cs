using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TheDomain.Application.Events;
using TheDomain.Application.Events.Contracts;

namespace TheDomain.Api.Endpoints;

public static class PublicEventEndpoint
{
    public static IEndpointRouteBuilder MapPublicEventEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var events = endpoints.MapGroup("/api/public/events").WithTags("Public Events").AllowAnonymous();
        events.MapGet("/upcoming", (IEventService service, CancellationToken token) => service.GetUpcomingAsync(token));
        events.MapGet("/previous", (IEventService service, CancellationToken token) => service.GetPreviousAsync(token));
        events.MapGet("/featured", (IEventService service, CancellationToken token) => service.GetFeaturedAsync(token));
        events.MapGet("/{slug}", GetEventAsync);
        var gallery = endpoints.MapGroup("/api/public/gallery/albums").WithTags("Public Gallery").AllowAnonymous();
        gallery.MapGet("/", (IEventService service, CancellationToken token) => service.GetGalleryAlbumsAsync(token));
        gallery.MapGet("/{eventSlug}", GetAlbumAsync);
        return endpoints;
    }

    private static async Task<Results<Ok<PublicEventResponse>, NotFound<ProblemDetails>>> GetEventAsync(string slug, [FromServices] IEventService service, CancellationToken token)
    {
        var item = await service.GetPublicBySlugAsync(slug, token);
        return item is null ? TypedResults.NotFound(NotFoundProblem()) : TypedResults.Ok(item);
    }
    private static async Task<Results<Ok<GalleryAlbumResponse>, NotFound<ProblemDetails>>> GetAlbumAsync(string eventSlug, [FromServices] IEventService service, CancellationToken token)
    {
        var item = await service.GetGalleryAlbumAsync(eventSlug, token);
        return item is null ? TypedResults.NotFound(NotFoundProblem()) : TypedResults.Ok(item);
    }
    private static ProblemDetails NotFoundProblem() => new() { Status = 404, Title = "Resource not found.", Type = "https://httpstatuses.com/404" };
}
