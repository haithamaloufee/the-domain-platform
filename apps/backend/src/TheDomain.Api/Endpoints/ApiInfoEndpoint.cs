using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http.HttpResults;
using TheDomain.Api.Configuration;
using TheDomain.SharedKernel.Api;

namespace TheDomain.Api.Endpoints;

public static class ApiInfoEndpoint
{
    public static IEndpointRouteBuilder MapApiInfoEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/info", GetApiInfo)
            .WithName("GetApiInfo")
            .WithSummary("Returns non-sensitive API runtime information.")
            .Produces<ApiInfoResponse>(StatusCodes.Status200OK);

        return endpoints;
    }

    private static Ok<ApiInfoResponse> GetApiInfo(
        IOptions<ApiOptions> options,
        IHostEnvironment environment,
        TimeProvider timeProvider)
    {
        var response = new ApiInfoResponse(
            options.Value.ApplicationName,
            environment.EnvironmentName,
            options.Value.Version,
            timeProvider.GetUtcNow());

        return TypedResults.Ok(response);
    }
}
