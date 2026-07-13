using Microsoft.AspNetCore.Authorization;
using TheDomain.Domain.Identity;

namespace TheDomain.Api.Authorization;

public static class AuthorizationPolicies
{
    public const string SuperAdminOnly = nameof(SuperAdminOnly);
    public const string AdminDashboardAccess = nameof(AdminDashboardAccess);
    public const string MediaManagerOrAbove = nameof(MediaManagerOrAbove);
    public const string EditorOrAbove = nameof(EditorOrAbove);

    public static void AddDomainPolicies(AuthorizationOptions options)
    {
        options.AddPolicy(SuperAdminOnly, policy => policy.RequireRole(UserRole.SuperAdmin.ToString()));
        options.AddPolicy(AdminDashboardAccess, policy => policy.RequireRole(UserRole.Admin.ToString(), UserRole.SuperAdmin.ToString()));
        options.AddPolicy(MediaManagerOrAbove, policy => policy.RequireRole(UserRole.MediaManager.ToString(), UserRole.Admin.ToString(), UserRole.SuperAdmin.ToString()));
        options.AddPolicy(EditorOrAbove, policy => policy.RequireRole(Enum.GetNames<UserRole>()));
    }
}
