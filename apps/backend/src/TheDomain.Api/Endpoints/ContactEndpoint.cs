using TheDomain.Api.Authorization;
using TheDomain.Application.Contact;
using TheDomain.Domain.Contact;

namespace TheDomain.Api.Endpoints;

public static class ContactEndpoint
{
    public static void MapContactEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/public/contact", SubmitAsync).AllowAnonymous().RequireRateLimiting("contact-submissions");
        var inbox = endpoints.MapGroup("/api/admin/messages").RequireAuthorization(AuthorizationPolicies.AdminDashboardAccess);
        inbox.MapGet("/", ListAsync);
        inbox.MapPost("/{id:guid}/read", MarkReadAsync);
    }

    private static async Task<IResult> SubmitAsync(SubmitContactRequest request, HttpContext context,
        TimeProvider clock, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.Website)) return Results.Accepted();
        var name = request.Name?.Trim() ?? "";
        var email = request.Email?.Trim() ?? "";
        var message = request.Message?.Trim() ?? "";
        var errors = ContactValidation.Validate(name, email, message);
        if (errors.Count > 0) return Results.ValidationProblem(errors);
        if (context.RequestServices.GetService<IContactInbox>() is not { } inbox) return Unavailable();

        await inbox.SubmitAsync(new ContactMessage(Guid.NewGuid(), name, email, message, clock.GetUtcNow()), cancellationToken);
        return Results.Accepted();
    }

    private static async Task<IResult> ListAsync(int? offset, HttpContext context, CancellationToken cancellationToken)
    {
        if (context.RequestServices.GetService<IContactInbox>() is not { } inbox) return Unavailable();
        return Results.Ok(await inbox.ListAsync(Math.Clamp(offset ?? 0, 0, 100_000), cancellationToken));
    }

    private static async Task<IResult> MarkReadAsync(Guid id, HttpContext context, TimeProvider clock, CancellationToken cancellationToken)
    {
        if (context.RequestServices.GetService<IContactInbox>() is not { } inbox) return Unavailable();
        return await inbox.MarkReadAsync(id, clock.GetUtcNow(), cancellationToken) ? Results.NoContent() : Results.NotFound();
    }

    private static IResult Unavailable() => Results.Problem("The contact inbox is temporarily unavailable.", statusCode: 503);
}
