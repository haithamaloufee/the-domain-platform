using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVisualAboutPageAndTeamManager : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "about_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    IsHeroEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    HeroEyebrow = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HeroHeading = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    HeroText = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: false),
                    HeroMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    HeroPresentation = table.Column<int>(type: "integer", nullable: false),
                    IntroStatement = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: false),
                    IsStoryEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    StoryHeading = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StoryText = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: false),
                    StoryHighlight = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    IsTeamEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TeamHeading = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TeamText = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: false),
                    IsPartnersEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    PartnersHeading = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PartnersText = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: false),
                    IsReachOutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ReachOutHeading = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ReachOutText = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: false),
                    ReachOutCtaLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReachOutCtaHref = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    SeoTitle = table.Column<string>(type: "character varying(70)", maxLength: 70, nullable: true),
                    SeoDescription = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    SocialImageMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_about_settings", x => x.Id);
                    table.CheckConstraint("ck_about_settings_singleton", "\"Id\" = 'b8fe531e-7d4f-4b50-b3d6-e5de2a69b37e'");
                    table.ForeignKey(
                        name: "FK_about_settings_media_assets_HeroMediaAssetId",
                        column: x => x.HeroMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_about_settings_media_assets_SocialImageMediaAssetId",
                        column: x => x.SocialImageMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "team_members",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Role = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Biography = table.Column<string>(type: "character varying(700)", maxLength: 700, nullable: true),
                    PhotoMediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_members", x => x.Id);
                    table.ForeignKey(
                        name: "FK_team_members_media_assets_PhotoMediaAssetId",
                        column: x => x.PhotoMediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_about_settings_HeroMediaAssetId",
                table: "about_settings",
                column: "HeroMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_about_settings_IsPublished",
                table: "about_settings",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_about_settings_SocialImageMediaAssetId",
                table: "about_settings",
                column: "SocialImageMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_team_members_IsVisible_SortOrder",
                table: "team_members",
                columns: ["IsVisible", "SortOrder"]);

            migrationBuilder.CreateIndex(
                name: "IX_team_members_PhotoMediaAssetId",
                table: "team_members",
                column: "PhotoMediaAssetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "about_settings");

            migrationBuilder.DropTable(
                name: "team_members");
        }
    }
}
