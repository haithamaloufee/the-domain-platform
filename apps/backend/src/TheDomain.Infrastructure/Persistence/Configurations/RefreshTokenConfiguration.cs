using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.Identity;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");
        builder.HasKey(token => token.Id);
        builder.Property(token => token.Id).ValueGeneratedNever();
        builder.Property(token => token.TokenHash).HasMaxLength(64).IsFixedLength().IsRequired();
        builder.HasIndex(token => token.TokenHash).IsUnique();
        builder.HasIndex(token => new { token.UserId, token.ExpiresAtUtc });
        builder.Property(token => token.ReplacedByTokenHash).HasMaxLength(64).IsFixedLength();
        builder.Property(token => token.CreatedByIp).HasMaxLength(64);
        builder.Property(token => token.UserAgent).HasMaxLength(512);
        builder.Property(token => token.ExpiresAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(token => token.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(token => token.RevokedAtUtc).HasColumnType("timestamp with time zone");
    }
}
