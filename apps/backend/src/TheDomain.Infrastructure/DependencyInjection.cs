using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text;
using TheDomain.Infrastructure.Persistence;
using TheDomain.Application.Authentication;
using TheDomain.Infrastructure.Authentication;
using TheDomain.Application.Events;
using TheDomain.Application.Media;
using TheDomain.Infrastructure.Media;
using TheDomain.Application.Homepage;

namespace TheDomain.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var databaseSection = configuration.GetRequiredSection(DatabaseOptions.SectionName);
        var databaseOptions = databaseSection.Get<DatabaseOptions>() ?? new DatabaseOptions();
        var jwtSection = configuration.GetRequiredSection(JwtOptions.SectionName);
        var jwtOptions = jwtSection.Get<JwtOptions>() ?? new JwtOptions();
        var initialAdminOptions = configuration.GetRequiredSection(InitialAdminOptions.SectionName).Get<InitialAdminOptions>() ?? new InitialAdminOptions();
        var cloudinarySection = configuration.GetRequiredSection(CloudinaryOptions.SectionName);
        var cloudinaryOptions = cloudinarySection.Get<CloudinaryOptions>() ?? new CloudinaryOptions();

        services.AddOptions<DatabaseOptions>()
            .Bind(databaseSection)
            .ValidateDataAnnotations()
            .Validate(
                options => !options.Enabled || !string.IsNullOrWhiteSpace(options.ConnectionString),
                "A database connection string is required when persistence is enabled.")
            .ValidateOnStart();

        services.AddOptions<JwtOptions>()
            .Bind(jwtSection)
            .Validate(options => !options.Enabled || (!string.IsNullOrWhiteSpace(options.Issuer) && !string.IsNullOrWhiteSpace(options.Audience)), "Issuer and audience are required when authentication is enabled.")
            .Validate(options => !options.Enabled || Encoding.UTF8.GetByteCount(options.SigningKey) >= 32, "The JWT signing key must contain at least 32 UTF-8 bytes.")
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddOptions<InitialAdminOptions>().Bind(configuration.GetRequiredSection(InitialAdminOptions.SectionName)).ValidateOnStart();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddOptions<CloudinaryOptions>()
            .Bind(cloudinarySection)
            .ValidateDataAnnotations()
            .Validate(options => !options.Enabled || (!string.IsNullOrWhiteSpace(options.CloudName) && !string.IsNullOrWhiteSpace(options.ApiKey) && !string.IsNullOrWhiteSpace(options.ApiSecret)), "Cloudinary credentials are required when media storage is enabled.")
            .ValidateOnStart();
        services.AddSingleton(new MediaUploadPolicy(
            cloudinaryOptions.MaxImageSizeMb * 1024L * 1024L,
            cloudinaryOptions.MaxVideoSizeMb * 1024L * 1024L,
            CreateAllowedMediaTypes(cloudinaryOptions)));
        services.AddScoped<IMediaStorageService, CloudinaryMediaStorageService>();

        if (!databaseOptions.Enabled)
        {
            services.AddScoped<IAuthService, DisabledAuthService>();
            services.AddScoped<IEventService, DisabledEventService>();
            services.AddScoped<DisabledMediaService>();
            services.AddScoped<IMediaManagementService>(provider => provider.GetRequiredService<DisabledMediaService>());
            services.AddScoped<IMediaQueryService>(provider => provider.GetRequiredService<DisabledMediaService>());
            services.AddScoped<IHomepageCmsService, DisabledHomepageCmsService>();
            return services;
        }

        services.AddDbContext<TheDomainDbContext>(options => options.UseNpgsql(
            databaseOptions.ConnectionString,
            postgreSqlOptions => postgreSqlOptions.CommandTimeout(databaseOptions.CommandTimeoutSeconds)));
        services.AddScoped<IIdentityRepository, IdentityRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IMediaRepository, MediaRepository>();
        services.AddScoped<MediaManagementService>();
        services.AddScoped<IMediaManagementService>(provider => provider.GetRequiredService<MediaManagementService>());
        services.AddScoped<IMediaQueryService>(provider => provider.GetRequiredService<MediaManagementService>());
        services.AddScoped<IHomepageCmsRepository, HomepageCmsRepository>();
        services.AddScoped<IHomepageCmsService, HomepageCmsService>();
        if (jwtOptions.Enabled && initialAdminOptions.Enabled)
        {
            services.AddHostedService<InitialAdminProvisioner>();
        }

        services.AddHealthChecks().AddNpgSql(
            databaseOptions.ConnectionString!,
            name: "postgresql",
            failureStatus: HealthStatus.Unhealthy,
            tags: ["database", "postgresql"]);

        return services;
    }

    private static Dictionary<string, string[]> CreateAllowedMediaTypes(CloudinaryOptions options)
    {
        Dictionary<string, string[]> known = new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = [".jpg", ".jpeg"], ["image/png"] = [".png"], ["image/webp"] = [".webp"],
            ["video/mp4"] = [".mp4"], ["video/webm"] = [".webm"], ["video/quicktime"] = [".mov"]
        };
        return options.AllowedImageMimeTypes.Concat(options.AllowedVideoMimeTypes)
            .Distinct(StringComparer.OrdinalIgnoreCase).Where(known.ContainsKey)
            .ToDictionary(value => value, value => known[value], StringComparer.OrdinalIgnoreCase);
    }
}
