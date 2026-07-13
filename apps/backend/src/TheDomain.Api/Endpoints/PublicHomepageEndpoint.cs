using TheDomain.Application.Homepage;

namespace TheDomain.Api.Endpoints;

public static class PublicHomepageEndpoint
{
    public static IEndpointRouteBuilder MapPublicHomepageEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/public").WithTags("Public Homepage CMS").AllowAnonymous();
        group.MapGet("/homepage", (IHomepageCmsService service, CancellationToken token) =>
            service.GetPublicHomepageAsync(token));
        group.MapGet("/statistics", (IHomepageCmsService service, CancellationToken token) =>
            service.GetPublicStatisticsAsync(token));
        group.MapGet("/partners", (IHomepageCmsService service, CancellationToken token) =>
            service.GetPublicPartnersAsync(token));
        return endpoints;
    }
}
