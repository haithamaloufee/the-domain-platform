using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.About;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class AboutSettingsConfiguration : IEntityTypeConfiguration<AboutSettings>
{
    public void Configure(EntityTypeBuilder<AboutSettings> builder)
    {
        builder.ToTable("about_settings", table => table.HasCheckConstraint("ck_about_settings_singleton", $"\"Id\" = '{AboutSettings.SingletonId}'")); builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.IsPublished);
        builder.HasOne<TheDomain.Domain.Media.MediaAsset>().WithMany().HasForeignKey(x => x.HeroMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<TheDomain.Domain.Media.MediaAsset>().WithMany().HasForeignKey(x => x.SocialImageMediaAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
