using TheDomain.Api.Authorization;
using TheDomain.Application.Homepage;
using TheDomain.Application.Homepage.Contracts;

namespace TheDomain.Api.Endpoints;

public static class AdminHomepageCmsEndpoint
{
    public static IEndpointRouteBuilder MapAdminHomepageCmsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var homepage = endpoints.MapGroup("/api/admin/homepage").WithTags("Admin Homepage CMS")
            .RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess);
        homepage.MapGet("/", (IHomepageCmsService service, CancellationToken token) =>
            service.GetAdminHomepageAsync(token));
        homepage.MapPut("/", async (UpdateHomepageContentRequest request,
            IHomepageCmsService service, CancellationToken token) =>
            ToResult(await service.UpdateHomepageAsync(request, token)));

        var statistics = endpoints.MapGroup("/api/admin/statistics").WithTags("Admin Statistics")
            .RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess);
        statistics.MapGet("/", (IHomepageCmsService service, CancellationToken token) =>
            service.GetAdminStatisticsAsync(token));
        statistics.MapPost("/", CreateStatisticAsync);
        statistics.MapPut("/{id:guid}", async (Guid id, SaveStatisticRequest request,
            IHomepageCmsService service, CancellationToken token) =>
            ToResult(await service.UpdateStatisticAsync(id, request, token)));
        statistics.MapPost("/{id:guid}/show", async (Guid id, IHomepageCmsService service,
            CancellationToken token) => ToResult(await service.SetStatisticVisibilityAsync(id, true, token)));
        statistics.MapPost("/{id:guid}/hide", async (Guid id, IHomepageCmsService service,
            CancellationToken token) => ToResult(await service.SetStatisticVisibilityAsync(id, false, token)));
        statistics.MapDelete("/{id:guid}", async (Guid id, IHomepageCmsService service,
            CancellationToken token) => ToResult(await service.SetStatisticVisibilityAsync(id, false, token)));

        var partners = endpoints.MapGroup("/api/admin/partners").WithTags("Admin Partners")
            .RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess);
        partners.MapGet("/", (IHomepageCmsService service, CancellationToken token) =>
            service.GetAdminPartnersAsync(token));
        partners.MapPost("/", CreatePartnerAsync);
        partners.MapPut("/{id:guid}", async (Guid id, SavePartnerRequest request,
            IHomepageCmsService service, CancellationToken token) =>
            ToResult(await service.UpdatePartnerAsync(id, request, token)));
        partners.MapPost("/{id:guid}/show", async (Guid id, IHomepageCmsService service,
            CancellationToken token) => ToResult(await service.SetPartnerVisibilityAsync(id, true, token)));
        partners.MapPost("/{id:guid}/hide", async (Guid id, IHomepageCmsService service,
            CancellationToken token) => ToResult(await service.SetPartnerVisibilityAsync(id, false, token)));
        partners.MapDelete("/{id:guid}", async (Guid id, IHomepageCmsService service,
            CancellationToken token) => ToResult(await service.SetPartnerVisibilityAsync(id, false, token)));

        return endpoints;
    }

    private static async Task<IResult> CreateStatisticAsync(SaveStatisticRequest request,
        IHomepageCmsService service, CancellationToken token)
    {
        var result = await service.CreateStatisticAsync(request, token);
        return result.IsSuccess
            ? Results.Created($"/api/admin/statistics/{result.Value!.Id}", result.Value)
            : ToProblem(result);
    }

    private static async Task<IResult> CreatePartnerAsync(SavePartnerRequest request,
        IHomepageCmsService service, CancellationToken token)
    {
        var result = await service.CreatePartnerAsync(request, token);
        return result.IsSuccess
            ? Results.Created($"/api/admin/partners/{result.Value!.Id}", result.Value)
            : ToProblem(result);
    }

    private static IResult ToResult<T>(CmsOperationResult<T> result) =>
        result.IsSuccess ? Results.Ok(result.Value) : ToProblem(result);

    private static IResult ToProblem<T>(CmsOperationResult<T> result)
    {
        var status = result.FailureKind switch
        {
            CmsFailureKind.NotFound => StatusCodes.Status404NotFound,
            CmsFailureKind.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status400BadRequest
        };
        return Results.Problem(statusCode: status, title: "Homepage CMS operation failed.",
            detail: string.Join(" ", result.Errors), type: $"https://httpstatuses.com/{status}");
    }
}
