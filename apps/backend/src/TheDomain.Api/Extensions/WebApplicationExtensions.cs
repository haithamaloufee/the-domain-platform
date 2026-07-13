using Serilog;
using TheDomain.Api.Configuration;
using TheDomain.Api.Endpoints;

namespace TheDomain.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApiFoundation(this WebApplication app)
    {
        app.UseExceptionHandler();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseSerilogRequestLogging();
        app.UseCors(CorsOptions.PolicyName);
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }

    public static IEndpointRouteBuilder MapApiEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthEndpoint();
        endpoints.MapApiInfoEndpoint();
        endpoints.MapAuthenticationEndpoints();
        endpoints.MapPublicEventEndpoints();
        endpoints.MapAdminEventEndpoints();
        endpoints.MapAdminMediaEndpoints();
        endpoints.MapAdminEventMediaEndpoints();

        return endpoints;
    }
}
