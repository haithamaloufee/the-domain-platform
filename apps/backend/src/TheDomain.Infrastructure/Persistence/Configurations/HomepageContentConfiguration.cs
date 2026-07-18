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
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => item.IsPublished);
        builder.Property(item => item.IsStatisticsPhraseEnabled).HasDefaultValue(true);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.HeroMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.Property(item => item.IsFloatingVideoEnabled).HasDefaultValue(false);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.FloatingVideoMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.FloatingVideoPosterMediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<MediaCollection>().WithMany().HasForeignKey(item => item.GalleryCollectionId).OnDelete(DeleteBehavior.SetNull);
    }
}
