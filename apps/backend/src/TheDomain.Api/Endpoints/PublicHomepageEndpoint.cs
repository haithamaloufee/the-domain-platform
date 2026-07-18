using TheDomain.Application.Homepage;
using TheDomain.Application.Caching;

namespace TheDomain.Api.Endpoints;

public static class PublicHomepageEndpoint
{
    public static IEndpointRouteBuilder MapPublicHomepageEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/public").WithTags("Public Homepage CMS").AllowAnonymous();
        group.MapGet("/homepage", (IHomepageCmsService service, CancellationToken token) =>
            service.GetPublicHomepageAsync(token)).CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(1))
                .Tag(PublicCacheTags.Homepage, PublicCacheTags.Events, PublicCacheTags.Gallery,
                    PublicCacheTags.Partners, PublicCacheTags.Statistics, PublicCacheTags.Media));
        group.MapGet("/statistics", async (HttpContext context, IHomepageCmsService service, CancellationToken token) =>
        {
            AddDeprecationHeaders(context);
            return await service.GetPublicStatisticsAsync(token);
        }).CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(1)).Tag(PublicCacheTags.Statistics));
        group.MapGet("/partners", async (HttpContext context, IHomepageCmsService service, CancellationToken token) =>
        {
            AddDeprecationHeaders(context);
            return await service.GetPublicPartnersAsync(token);
        }).CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(1)).Tag(PublicCacheTags.Partners, PublicCacheTags.Media));
        return endpoints;
    }

    private static void AddDeprecationHeaders(HttpContext context)
    {
        context.Response.Headers["Deprecation"] = "true";
        context.Response.Headers.Warning = "299 - \"Deprecated public summary endpoint; use /api/public/homepage for Homepage data\"";
    }
}
