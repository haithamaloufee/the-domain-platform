using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHomepageCms : Migration
    {
        private static readonly string[] StatisticVisibilityColumns = ["IsVisible", "IsVerified", "SortOrder"];
        private static readonly string[] PartnerVisibilityColumns = ["IsVisible", "SortOrder"];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "homepage_content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HeroEyebrow = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HeroTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    HeroAccent = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    HeroDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    PrimaryCtaLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PrimaryCtaHref = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    SecondaryCtaLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SecondaryCtaHref = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    WhyTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    WhyDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ServicesTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ServicesDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    PartnersTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PartnersDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ContactTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ContactCtaLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactCtaHref = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_homepage_content", x => x.Id);
                    table.CheckConstraint("ck_homepage_content_singleton", "\"Id\" = '6f44ac8f-0cc7-4caf-988d-5e666469f48e'");
                });

            migrationBuilder.CreateTable(
                name: "homepage_statistics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Suffix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_homepage_statistics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "partners",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Slug = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    LogoUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    WebsiteUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partners", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_homepage_content_IsPublished",
                table: "homepage_content",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_homepage_statistics_IsVisible_IsVerified_SortOrder",
                table: "homepage_statistics",
                columns: StatisticVisibilityColumns);

            migrationBuilder.CreateIndex(
                name: "IX_partners_IsFeatured",
                table: "partners",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_partners_IsVisible_SortOrder",
                table: "partners",
                columns: PartnerVisibilityColumns);

            migrationBuilder.CreateIndex(
                name: "IX_partners_Slug",
                table: "partners",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "homepage_content");

            migrationBuilder.DropTable(
                name: "homepage_statistics");

            migrationBuilder.DropTable(
                name: "partners");
        }
    }
}
