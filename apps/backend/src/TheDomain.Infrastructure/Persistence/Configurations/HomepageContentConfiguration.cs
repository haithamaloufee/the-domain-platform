using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Homepage;
using TheDomain.Domain.Media;

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
        builder.Property(item => item.StatisticsPhrase).HasMaxLength(180).HasDefaultValue("Moments that move with us");
        builder.Property(item => item.IsStatisticsPhraseEnabled).HasDefaultValue(true);
        builder.Property(item => item.SectionOrder).HasMaxLength(200).HasDefaultValue("events,statistics,why,previous,gallery,services,partners,contact");
        builder.Property(item => item.DisabledSections).HasMaxLength(200).HasDefaultValue(string.Empty);
        builder.Property(item => item.EventsTitle).HasMaxLength(160).HasDefaultValue("Upcoming experiences"); builder.Property(item => item.EventsDescription).HasMaxLength(500).HasDefaultValue("The next Domain experiences.");
        builder.Property(item => item.PreviousEventsTitle).HasMaxLength(160).HasDefaultValue("Previous events"); builder.Property(item => item.PreviousEventsDescription).HasMaxLength(500).HasDefaultValue("Moments that continue to shape The Domain.");
        builder.Property(item => item.GalleryTitle).HasMaxLength(160).HasDefaultValue("Gallery highlights"); builder.Property(item => item.GalleryDescription).HasMaxLength(500).HasDefaultValue("Curated photography and film from The Domain.");
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.HeroMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<MediaCollection>().WithMany().HasForeignKey(item => item.GalleryCollectionId).OnDelete(DeleteBehavior.SetNull);
    }
}
