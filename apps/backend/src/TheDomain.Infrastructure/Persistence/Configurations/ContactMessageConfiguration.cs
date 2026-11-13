using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Contact;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.ToTable("contact_messages");
        builder.HasKey(message => message.Id);
        builder.Property(message => message.Id).ValueGeneratedNever();
        builder.Property(message => message.Name).HasMaxLength(120);
        builder.Property(message => message.Email).HasMaxLength(254);
        builder.Property(message => message.Message).HasMaxLength(3000);
        builder.HasIndex(message => new { message.CreatedAtUtc, message.Id });
    }
}
