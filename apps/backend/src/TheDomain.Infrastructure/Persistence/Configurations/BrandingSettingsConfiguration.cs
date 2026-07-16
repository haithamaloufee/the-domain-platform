using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Branding;
using TheDomain.Domain.Media;
namespace TheDomain.Infrastructure.Persistence.Configurations;
public sealed class BrandingSettingsConfiguration : IEntityTypeConfiguration<BrandingSettings>
{
    public void Configure(EntityTypeBuilder<BrandingSettings> builder)
    {
        builder.ToTable("branding_settings", table => table.HasCheckConstraint("ck_branding_settings_singleton", $"\"Id\" = '{BrandingSettings.SingletonId}'")); builder.HasKey(item => item.Id);
        builder.Property(item => item.SiteName).HasMaxLength(100).IsRequired(); builder.Property(item => item.BrandDescription).HasMaxLength(240); builder.Property(item => item.DefaultSeoTitle).HasMaxLength(120).IsRequired(); builder.Property(item => item.DefaultSeoDescription).HasMaxLength(320).IsRequired();
        builder.Property(item => item.PublicEmail).HasMaxLength(254); builder.Property(item => item.PublicPhone).HasMaxLength(40); builder.Property(item => item.WhatsApp).HasMaxLength(120); builder.Property(item => item.PublicAddress).HasMaxLength(240);
        foreach (var property in new[] { nameof(BrandingSettings.InstagramUrl), nameof(BrandingSettings.FacebookUrl), nameof(BrandingSettings.YouTubeUrl), nameof(BrandingSettings.TikTokUrl), nameof(BrandingSettings.LinkedInUrl), nameof(BrandingSettings.XUrl), nameof(BrandingSettings.SnapchatUrl) }) builder.Property<string?>(property).HasMaxLength(500);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.PrimaryLogoMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.AlternateLogoMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.FaviconMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.SocialImageMediaAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
