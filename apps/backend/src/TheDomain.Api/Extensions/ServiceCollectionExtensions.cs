using Microsoft.OpenApi.Models;
using TheDomain.Api.Configuration;
using TheDomain.Api.ErrorHandling;
using TheDomain.Application;
using TheDomain.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using TheDomain.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using TheDomain.Api.Authorization;
using TheDomain.Infrastructure.Authentication;
using TheDomain.Api.Caching;
using TheDomain.Application.Caching;

namespace TheDomain.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiFoundation(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddApplication();
        services.AddInfrastructure(configuration);

        var jwtOptions = configuration.GetRequiredSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        var signingKey = jwtOptions.Enabled ? Encoding.UTF8.GetBytes(jwtOptions.SigningKey) : RandomNumberGenerator.GetBytes(32);
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = jwtOptions.Enabled,
                ValidIssuer = jwtOptions.Issuer,
                ValidateAudience = jwtOptions.Enabled,
                ValidAudience = jwtOptions.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(signingKey),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30),
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role
            };
            if (jwtOptions.Enabled)
                options.Events = new JwtBearerEvents { OnTokenValidated = ValidateActiveUserAsync };
        });
        services.AddAuthorization(AuthorizationPolicies.AddDomainPolicies);
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy("auth-attempts", context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 20,
                    Window = TimeSpan.FromMinutes(1)
                }));
            options.AddPolicy("contact-submissions", context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1)
                }));
        });

        services.AddSingleton(TimeProvider.System);
        services.AddHealthChecks();
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddOutputCache();
        services.AddSingleton<IPublicOutputCacheInvalidator, PublicOutputCacheInvalidator>();

        services.AddOptions<ApiOptions>()
            .Bind(configuration.GetRequiredSection(ApiOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CorsOptions>()
            .Bind(configuration.GetRequiredSection(CorsOptions.SectionName))
            .Validate(
                options => !environment.IsProduction() || options.AllowedOrigins.Length > 0,
                "At least one CORS origin must be configured in Production.")
            .ValidateOnStart();

        var corsOptions = configuration
            .GetRequiredSection(CorsOptions.SectionName)
            .Get<CorsOptions>() ?? new CorsOptions();

        services.AddCors(options => options.AddPolicy(
            CorsOptions.PolicyName,
            policy =>
            {
                if (corsOptions.AllowedOrigins.Length > 0)
                {
                    policy.WithOrigins(corsOptions.AllowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                }
            }));

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options => options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "The Domain API",
            Version = "v1",
            Description = "Backend API for The Domain Platform."
        }));

        return services;
    }

    private static async Task ValidateActiveUserAsync(TokenValidatedContext context)
    {
        if (!Guid.TryParse(context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId) ||
            context.HttpContext.RequestServices.GetService<TheDomainDbContext>() is not { } database)
        {
            context.Fail("The session is invalid.");
            return;
        }

        var current = await database.Users.AsNoTracking().Where(user => user.Id == userId && user.IsActive)
            .Select(user => new { user.Role, user.Email, user.FullName })
            .SingleOrDefaultAsync(context.HttpContext.RequestAborted);
        if (current is null ||
            current.Role.ToString() != context.Principal!.FindFirstValue(ClaimTypes.Role) ||
            current.Email != context.Principal.FindFirstValue(JwtRegisteredClaimNames.Email) ||
            current.FullName != context.Principal.FindFirstValue(ClaimTypes.Name))
        {
            context.Fail("The session is invalid.");
        }
    }
}
