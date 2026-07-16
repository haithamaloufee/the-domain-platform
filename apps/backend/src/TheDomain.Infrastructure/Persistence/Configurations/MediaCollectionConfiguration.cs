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
        builder.HasIndex(item => item.Name).IsUnique(); builder.HasIndex(item => item.IsArchived);
    }
}
