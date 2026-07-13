using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class MediaAssetConfiguration : IEntityTypeConfiguration<MediaAsset>
{
    public void Configure(EntityTypeBuilder<MediaAsset> builder)
    {
        builder.ToTable("media_assets"); builder.HasKey(item => item.Id);
        builder.Property(item => item.FileName).HasMaxLength(255).IsRequired(); builder.Property(item => item.OriginalFileName).HasMaxLength(255).IsRequired();
        builder.Property(item => item.MediaType).HasConversion<string>().HasMaxLength(16).IsRequired(); builder.Property(item => item.Url).HasMaxLength(2048).IsRequired();
        builder.Property(item => item.ThumbnailUrl).HasMaxLength(2048); builder.Property(item => item.DurationSeconds).HasPrecision(10, 3);
        builder.Property(item => item.Orientation).HasConversion<string>().HasMaxLength(16).IsRequired(); builder.Property(item => item.Category).HasMaxLength(100);
        builder.Property(item => item.Caption).HasMaxLength(1000); builder.Property(item => item.AltText).HasMaxLength(500);
        builder.Property(item => item.ApprovalStatus).HasConversion<string>().HasMaxLength(16).IsRequired(); builder.Property(item => item.CloudinaryPublicId).HasMaxLength(255);
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone"); builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => item.ApprovalStatus); builder.HasIndex(item => item.MediaType); builder.HasIndex(item => item.CloudinaryPublicId).IsUnique();
    }
}
