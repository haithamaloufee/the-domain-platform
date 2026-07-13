using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Media;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class EventMediaConfiguration : IEntityTypeConfiguration<EventMedia>
{
    public void Configure(EntityTypeBuilder<EventMedia> builder)
    {
        builder.ToTable("event_media"); builder.HasKey(item => item.Id);
        builder.Property(item => item.Usage).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => new { item.EventId, item.MediaAssetId, item.Usage }).IsUnique();
        builder.HasIndex(item => new { item.EventId, item.SortOrder });
        builder.HasOne(item => item.MediaAsset).WithMany().HasForeignKey(item => item.MediaAssetId).OnDelete(DeleteBehavior.Restrict);
    }
}
