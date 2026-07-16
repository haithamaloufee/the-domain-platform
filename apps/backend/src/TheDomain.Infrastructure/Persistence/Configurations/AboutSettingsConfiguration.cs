using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.About;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class AboutSettingsConfiguration : IEntityTypeConfiguration<AboutSettings>
{
    public void Configure(EntityTypeBuilder<AboutSettings> builder)
    {
        builder.ToTable("about_settings", table => table.HasCheckConstraint("ck_about_settings_singleton", $"\"Id\" = '{AboutSettings.SingletonId}'")); builder.HasKey(x => x.Id);
        builder.Property(x => x.HeroEyebrow).HasMaxLength(100); builder.Property(x => x.HeroHeading).HasMaxLength(200); builder.Property(x => x.HeroText).HasMaxLength(700);
        builder.Property(x => x.IntroStatement).HasMaxLength(700); builder.Property(x => x.StoryHeading).HasMaxLength(200); builder.Property(x => x.StoryText).HasMaxLength(2500); builder.Property(x => x.StoryHighlight).HasMaxLength(300);
        builder.Property(x => x.TeamHeading).HasMaxLength(200); builder.Property(x => x.TeamText).HasMaxLength(700); builder.Property(x => x.PartnersHeading).HasMaxLength(200); builder.Property(x => x.PartnersText).HasMaxLength(700);
        builder.Property(x => x.ReachOutHeading).HasMaxLength(200); builder.Property(x => x.ReachOutText).HasMaxLength(700); builder.Property(x => x.ReachOutCtaLabel).HasMaxLength(100); builder.Property(x => x.ReachOutCtaHref).HasMaxLength(2048);
        builder.Property(x => x.SeoTitle).HasMaxLength(70); builder.Property(x => x.SeoDescription).HasMaxLength(180); builder.HasIndex(x => x.IsPublished);
        builder.HasOne<TheDomain.Domain.Media.MediaAsset>().WithMany().HasForeignKey(x => x.HeroMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<TheDomain.Domain.Media.MediaAsset>().WithMany().HasForeignKey(x => x.SocialImageMediaAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
