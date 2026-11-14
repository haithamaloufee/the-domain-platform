using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCentralizedBrandingSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "branding_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SiteName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BrandDescription = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    DefaultSeoTitle = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    DefaultSeoDescription = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    PrimaryLogoMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    AlternateLogoMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    FaviconMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    SocialImageMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    PublicEmail = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    PublicPhone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    WhatsApp = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    PublicAddress = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: true),
                    InstagramUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FacebookUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    YouTubeUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TikTokUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LinkedInUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    XUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SnapchatUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_branding_settings", x => x.Id);
                    table.CheckConstraint("ck_branding_settings_singleton", "\"Id\" = '00000000-0000-0000-0000-000000000004'");
                    table.ForeignKey(
                        name: "FK_branding_settings_media_assets_AlternateLogoMediaAssetId",
                        column: x => x.AlternateLogoMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_branding_settings_media_assets_FaviconMediaAssetId",
                        column: x => x.FaviconMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_branding_settings_media_assets_PrimaryLogoMediaAssetId",
                        column: x => x.PrimaryLogoMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_branding_settings_media_assets_SocialImageMediaAssetId",
                        column: x => x.SocialImageMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_branding_settings_AlternateLogoMediaAssetId",
                table: "branding_settings",
                column: "AlternateLogoMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_branding_settings_FaviconMediaAssetId",
                table: "branding_settings",
                column: "FaviconMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_branding_settings_PrimaryLogoMediaAssetId",
                table: "branding_settings",
                column: "PrimaryLogoMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_branding_settings_SocialImageMediaAssetId",
                table: "branding_settings",
                column: "SocialImageMediaAssetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "branding_settings");
        }
    }
}
