using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Homepage;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class StatisticItemConfiguration : IEntityTypeConfiguration<StatisticItem>
{
    public void Configure(EntityTypeBuilder<StatisticItem> builder)
    {
        builder.ToTable("homepage_statistics");
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.Label).HasMaxLength(100).IsRequired();
        builder.Property(item => item.Value).HasMaxLength(50).IsRequired();
        builder.Property(item => item.Suffix).HasMaxLength(20);
        builder.Property(item => item.Description).HasMaxLength(500);
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => new { item.IsVisible, item.IsVerified, item.SortOrder });
    }
}
