using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace TheDomain.Api.Endpoints;

public static class HealthEndpoint
{
    public static IEndpointRouteBuilder MapHealthEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health", new HealthCheckOptions
            {
                AllowCachingResponses = false
            })
            .WithName("GetHealth")
            .WithSummary("Reports whether the API process is healthy.");

        return endpoints;
    }
}
