using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Homepage;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class HomepageContentConfiguration : IEntityTypeConfiguration<HomepageContent>
{
    public void Configure(EntityTypeBuilder<HomepageContent> builder)
    {
        builder.ToTable("homepage_content", table => table.HasCheckConstraint(
            "ck_homepage_content_singleton", $"\"Id\" = '{HomepageContent.SingletonId}'"));
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.HeroEyebrow).HasMaxLength(100).IsRequired();
        builder.Property(item => item.HeroTitle).HasMaxLength(200).IsRequired();
        builder.Property(item => item.HeroAccent).HasMaxLength(200);
        builder.Property(item => item.HeroDescription).HasMaxLength(1000).IsRequired();
        builder.Property(item => item.PrimaryCtaLabel).HasMaxLength(100).IsRequired();
        builder.Property(item => item.PrimaryCtaHref).HasMaxLength(2048).IsRequired();
        builder.Property(item => item.SecondaryCtaLabel).HasMaxLength(100);
        builder.Property(item => item.SecondaryCtaHref).HasMaxLength(2048);
        builder.Property(item => item.WhyTitle).HasMaxLength(200).IsRequired();
        builder.Property(item => item.WhyDescription).HasMaxLength(2000).IsRequired();
        builder.Property(item => item.ServicesTitle).HasMaxLength(200).IsRequired();
        builder.Property(item => item.ServicesDescription).HasMaxLength(1000).IsRequired();
        builder.Property(item => item.PartnersTitle).HasMaxLength(200).IsRequired();
        builder.Property(item => item.PartnersDescription).HasMaxLength(1000).IsRequired();
        builder.Property(item => item.ContactTitle).HasMaxLength(200).IsRequired();
        builder.Property(item => item.ContactDescription).HasMaxLength(1000).IsRequired();
        builder.Property(item => item.ContactCtaLabel).HasMaxLength(100).IsRequired();
        builder.Property(item => item.ContactCtaHref).HasMaxLength(2048).IsRequired();
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => item.IsPublished);
    }
}
