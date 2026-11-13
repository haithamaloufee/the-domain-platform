using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace TheDomain.Api.Endpoints;

public static class HealthEndpoint
{
    public static IEndpointRouteBuilder MapHealthEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false,
            AllowCachingResponses = false
        }).WithName("GetLiveness").WithSummary("Reports whether the API process is responding.");

        endpoints.MapHealthChecks("/health", new HealthCheckOptions
            {
                AllowCachingResponses = false
            })
            .WithName("GetHealth")
            .WithSummary("Reports whether the API and its configured dependencies are ready.");

        return endpoints;
    }
}
