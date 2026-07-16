using TheDomain.Api.Authorization;
using TheDomain.Application.Branding;
namespace TheDomain.Api.Endpoints;
public static class BrandingSettingsEndpoint
{
    public static IEndpointRouteBuilder MapBrandingSettingsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/public/branding", (IBrandingSettingsService service, CancellationToken token) => service.GetPublicAsync(token)).AllowAnonymous().WithTags("Public Branding");
        var admin = endpoints.MapGroup("/api/admin/branding").RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess).WithTags("Admin Branding");
        admin.MapGet("/", (IBrandingSettingsService service, CancellationToken token) => service.GetAdminAsync(token));
        admin.MapPut("/", async (UpdateBrandingSettingsRequest request, IBrandingSettingsService service, CancellationToken token) => { var result = await service.UpdateAsync(request, token); if (result.IsSuccess) return Results.Ok(result.Value); var status = result.FailureKind switch { TheDomain.Application.Events.EventFailureKind.NotFound => 404, TheDomain.Application.Events.EventFailureKind.Conflict => 409, _ => 400 }; return Results.Problem(statusCode: status, title: "Branding settings could not be saved.", detail: string.Join(" ", result.Errors)); });
        return endpoints;
    }
}
