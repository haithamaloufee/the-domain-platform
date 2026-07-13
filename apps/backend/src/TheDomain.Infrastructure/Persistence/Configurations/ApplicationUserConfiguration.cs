using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Identity;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("application_users");
        builder.HasKey(user => user.Id);
        builder.Property(user => user.FullName).HasMaxLength(150).IsRequired();
        builder.Property(user => user.Email).HasMaxLength(320).IsRequired();
        builder.Property(user => user.NormalizedEmail).HasMaxLength(320).IsRequired();
        builder.HasIndex(user => user.NormalizedEmail).IsUnique();
        builder.Property(user => user.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(user => user.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(user => user.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(user => user.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(user => user.LastLoginAtUtc).HasColumnType("timestamp with time zone");
        builder.HasMany(user => user.RefreshTokens).WithOne(token => token.User).HasForeignKey(token => token.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(user => user.RefreshTokens).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
