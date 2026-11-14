using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventPromotions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PromotionEnabled",
                table: "events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PromotionPercent",
                table: "events",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PromotionText",
                table: "events",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PromotionEnabled",
                table: "events");

            migrationBuilder.DropColumn(
                name: "PromotionPercent",
                table: "events");

            migrationBuilder.DropColumn(
                name: "PromotionText",
                table: "events");
        }
    }
}
