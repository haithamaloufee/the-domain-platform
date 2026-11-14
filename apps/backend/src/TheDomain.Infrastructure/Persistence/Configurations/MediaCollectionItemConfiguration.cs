using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class MediaCollectionItemConfiguration : IEntityTypeConfiguration<MediaCollectionItem>
{
    public void Configure(EntityTypeBuilder<MediaCollectionItem> builder)
    {
        builder.ToTable("media_collection_items"); builder.HasKey(item => new { item.CollectionId, item.MediaAssetId });
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => new { item.CollectionId, item.SortOrder });
        builder.HasOne(item => item.Collection).WithMany(item => item.Items).HasForeignKey(item => item.CollectionId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(item => item.MediaAsset).WithMany().HasForeignKey(item => item.MediaAssetId).OnDelete(DeleteBehavior.Cascade);
    }
}
