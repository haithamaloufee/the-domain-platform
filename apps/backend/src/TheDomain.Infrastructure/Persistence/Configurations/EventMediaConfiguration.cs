using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class EventMediaConfiguration : IEntityTypeConfiguration<EventMedia>
{
    public void Configure(EntityTypeBuilder<EventMedia> builder)
    {
        builder.ToTable("event_media", table =>
        {
            table.HasCheckConstraint("CK_event_media_FocalPointX", "\"FocalPointX\" >= 0.0 AND \"FocalPointX\" <= 1.0");
            table.HasCheckConstraint("CK_event_media_FocalPointY", "\"FocalPointY\" >= 0.0 AND \"FocalPointY\" <= 1.0");
            table.HasCheckConstraint("CK_event_media_Zoom", "\"Zoom\" >= 1.0 AND \"Zoom\" <= 3.0");
            table.HasCheckConstraint("CK_event_media_VideoPosterTimestampSeconds", "\"VideoPosterTimestampSeconds\" IS NULL OR (\"VideoPosterTimestampSeconds\" >= 0 AND \"VideoPosterTimestampSeconds\" <= 86400)");
        });
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Usage).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(item => item.FocalPointX).HasDefaultValue(EventMedia.DefaultFocalPoint).IsRequired();
        builder.Property(item => item.FocalPointY).HasDefaultValue(EventMedia.DefaultFocalPoint).IsRequired();
        builder.Property(item => item.Zoom).HasDefaultValue(EventMedia.DefaultZoom).IsRequired();
        builder.Property(item => item.VideoPosterMode).HasConversion<string>().HasMaxLength(24).HasDefaultValue(VideoPosterMode.Automatic).IsRequired();
        builder.Property(item => item.VideoPosterTimestampSeconds).HasPrecision(10, 3);
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => new { item.EventId, item.MediaAssetId, item.Usage }).IsUnique();
        builder.HasIndex(item => new { item.EventId, item.SortOrder });
        builder.HasOne(item => item.MediaAsset).WithMany().HasForeignKey(item => item.MediaAssetId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(item => item.CustomPosterMediaAsset).WithMany().HasForeignKey(item => item.CustomPosterMediaAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
