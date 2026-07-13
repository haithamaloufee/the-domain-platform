using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Events;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class EventConfiguration : IEntityTypeConfiguration<EntertainmentEvent>
{
    public void Configure(EntityTypeBuilder<EntertainmentEvent> builder)
    {
        builder.ToTable("events"); builder.HasKey(item => item.Id);
        builder.Property(item => item.Slug).HasMaxLength(160).IsRequired(); builder.HasIndex(item => item.Slug).IsUnique();
        builder.Property(item => item.Title).HasMaxLength(200).IsRequired();
        builder.Property(item => item.ShortDescription).HasMaxLength(500).IsRequired(); builder.Property(item => item.LongDescription).HasMaxLength(10000).IsRequired();
        builder.Property(item => item.EventType).HasMaxLength(100).IsRequired(); builder.Property(item => item.TimeZoneId).HasMaxLength(100).IsRequired();
        builder.Property(item => item.City).HasMaxLength(100).IsRequired(); builder.Property(item => item.VenueName).HasMaxLength(200).IsRequired();
        builder.Property(item => item.VenueAddress).HasMaxLength(500); builder.Property(item => item.MapUrl).HasMaxLength(2048); builder.Property(item => item.ExternalBookingUrl).HasMaxLength(2048);
        builder.Property(item => item.PublicationStatus).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(item => item.StartAtUtc).HasColumnType("timestamp with time zone"); builder.Property(item => item.EndAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.BookingOpensAtUtc).HasColumnType("timestamp with time zone"); builder.Property(item => item.BookingClosesAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(item => item.CreatedAtUtc).HasColumnType("timestamp with time zone"); builder.Property(item => item.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(item => item.StartAtUtc); builder.HasIndex(item => item.PublicationStatus); builder.HasIndex(item => item.ShowOnHomepage); builder.HasIndex(item => item.IsFeatured);
        builder.HasMany(item => item.Media).WithOne(link => link.Event).HasForeignKey(link => link.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(item => item.Media).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
