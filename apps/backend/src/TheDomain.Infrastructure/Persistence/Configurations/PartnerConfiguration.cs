using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Homepage;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class PartnerConfiguration : IEntityTypeConfiguration<Partner>
{
    public void Configure(EntityTypeBuilder<Partner> builder)
    {
        builder.ToTable("partners");
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.Name).HasMaxLength(150).IsRequired();
        builder.Property(item => item.Slug).HasMaxLength(160).IsRequired();
        builder.Property(item => item.LogoUrl).HasMaxLength(2048);
        builder.Property(item => item.WebsiteUrl).HasMaxLength(2048);
        builder.Property(item => item.Description).HasMaxLength(500);
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => item.Slug).IsUnique();
        builder.HasIndex(item => new { item.IsVisible, item.SortOrder });
        builder.HasIndex(item => item.IsFeatured);
    }
}
