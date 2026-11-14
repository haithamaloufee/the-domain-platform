using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheDomain.Domain.About;

namespace TheDomain.Infrastructure.Persistence.Configurations;

public sealed class TeamMemberConfiguration : IEntityTypeConfiguration<TeamMember>
{
    public void Configure(EntityTypeBuilder<TeamMember> builder)
    { builder.ToTable("team_members"); builder.HasKey(x => x.Id); builder.Property(x => x.Name).HasMaxLength(150); builder.Property(x => x.Role).HasMaxLength(150); builder.Property(x => x.Biography).HasMaxLength(700); builder.Property(x => x.ProfileUrl).HasMaxLength(2048); builder.HasIndex(x => new { x.IsVisible, x.SortOrder }); builder.HasOne<TheDomain.Domain.Media.MediaAsset>().WithMany().HasForeignKey(x => x.PhotoMediaAssetId).OnDelete(DeleteBehavior.Restrict); }
}
