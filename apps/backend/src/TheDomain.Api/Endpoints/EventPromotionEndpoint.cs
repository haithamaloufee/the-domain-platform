using Microsoft.EntityFrameworkCore;
using TheDomain.Api.Authorization;
using TheDomain.Application.Caching;
using TheDomain.Domain.Events;
using TheDomain.Infrastructure.Persistence;

namespace TheDomain.Api.Endpoints;

public static class EventPromotionEndpoint
{
    public static void MapEventPromotionEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var admin = endpoints.MapGroup("/api/admin/promotions").RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess);
        admin.MapGet("/{id:guid}", GetAsync);
        admin.MapPut("/{id:guid}", UpdateAsync);
        endpoints.MapGet("/api/public/promotions/{slug}", GetPublicAsync).AllowAnonymous();
    }

    private static async Task<IResult> GetAsync(Guid id, HttpContext context, CancellationToken cancellationToken)
    {
        if (context.RequestServices.GetService<TheDomainDbContext>() is not { } database) return Unavailable();
        var promotion = await database.Events.AsNoTracking().Where(item => item.Id == id)
            .Select(item => new Promotion(item.PromotionEnabled, item.PromotionPercent, item.PromotionText))
            .SingleOrDefaultAsync(cancellationToken);
        return promotion is null ? Results.NotFound() : Results.Ok(promotion);
    }

    private static async Task<IResult> UpdateAsync(Guid id, Promotion request, HttpContext context,
        TimeProvider clock, IPublicOutputCacheInvalidator cache, CancellationToken cancellationToken)
    {
        var text = request.Text?.Trim();
        if (request.Percent is < 1 or > 100 || text?.Length > 500 ||
            (request.Enabled && (request.Percent is null || string.IsNullOrWhiteSpace(text))))
            return Results.Problem("Enter a percentage between 1 and 100 and public terms up to 500 characters.", statusCode: 400);
        if (context.RequestServices.GetService<TheDomainDbContext>() is not { } database) return Unavailable();
        var item = await database.Events.FindAsync([id], cancellationToken);
        if (item is null) return Results.NotFound();
        item.SetPromotion(request.Enabled, request.Percent, text, clock.GetUtcNow());
        await database.SaveChangesAsync(cancellationToken);
        await cache.EvictAsync(cancellationToken, PublicCacheTags.Events);
        return Results.NoContent();
    }

    private static async Task<IResult> GetPublicAsync(string slug, HttpContext context, IConfiguration config,
        TimeProvider clock, CancellationToken cancellationToken)
    {
        if (!config.GetValue<bool>("Features:DiscountCampaignsEnabled") ||
            context.RequestServices.GetService<TheDomainDbContext>() is not { } database)
            return Results.NotFound();
        var item = await database.Events.AsNoTracking().SingleOrDefaultAsync(item => item.Slug == slug &&
            item.PublicationStatus == EventPublicationStatus.Published && item.PromotionEnabled, cancellationToken);
        return item is not null && item.EvaluateLifecycle(clock.GetUtcNow()).IsBookingActionable
            ? Results.Ok(new Promotion(true, item.PromotionPercent, item.PromotionText)) : Results.NotFound();
    }

    private static IResult Unavailable() => Results.Problem("Promotions are temporarily unavailable.", statusCode: 503);

    public sealed record Promotion(bool Enabled, int? Percent, string? Text);
}
