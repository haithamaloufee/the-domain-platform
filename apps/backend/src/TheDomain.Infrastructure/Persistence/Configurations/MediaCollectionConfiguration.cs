using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class MediaCollectionConfiguration : IEntityTypeConfiguration<MediaCollection>
{
    public void Configure(EntityTypeBuilder<MediaCollection> builder)
    {
        builder.ToTable("media_collections"); builder.HasKey(item => item.Id);
        builder.Property(item => item.Name).HasMaxLength(120).IsRequired();
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.ArchivedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.GalleryTitle).HasMaxLength(120); builder.Property(item => item.GalleryDescription).HasMaxLength(500);
        builder.Property(item => item.GalleryLayoutPreset).HasConversion<string>().HasMaxLength(24).HasDefaultValue(GalleryLayoutPreset.Editorial).IsRequired();
        builder.HasIndex(item => item.Name).IsUnique(); builder.HasIndex(item => item.IsArchived);
        builder.HasIndex(item => new { item.IsPublishedInGallery, item.GallerySortOrder });
        builder.HasOne<MediaAsset>().WithMany().HasForeignKey(item => item.GalleryFeaturedMediaAssetId).OnDelete(DeleteBehavior.SetNull);
    }
}
