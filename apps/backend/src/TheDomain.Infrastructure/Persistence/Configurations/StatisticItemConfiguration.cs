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
        builder.Property(item => item.SlotNumber);
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => new { item.IsVisible, item.IsVerified, item.SortOrder });
        builder.HasIndex(item => item.SlotNumber).IsUnique().HasFilter("\"SlotNumber\" IS NOT NULL");
        builder.ToTable("homepage_statistics", table => table.HasCheckConstraint(
            "ck_homepage_statistics_slot", "\"SlotNumber\" IS NULL OR (\"SlotNumber\" >= 1 AND \"SlotNumber\" <= 4)"));
    }
}
