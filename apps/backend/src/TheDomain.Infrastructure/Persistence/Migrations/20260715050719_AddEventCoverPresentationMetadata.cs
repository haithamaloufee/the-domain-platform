using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventCoverPresentationMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "FocalPointX",
                table: "event_media",
                type: "double precision",
                nullable: false,
                defaultValue: 0.5);

            migrationBuilder.AddColumn<double>(
                name: "FocalPointY",
                table: "event_media",
                type: "double precision",
                nullable: false,
                defaultValue: 0.5);

            migrationBuilder.AddColumn<double>(
                name: "Zoom",
                table: "event_media",
                type: "double precision",
                nullable: false,
                defaultValue: 1.0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_event_media_FocalPointX",
                table: "event_media",
                sql: "\"FocalPointX\" >= 0.0 AND \"FocalPointX\" <= 1.0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_event_media_FocalPointY",
                table: "event_media",
                sql: "\"FocalPointY\" >= 0.0 AND \"FocalPointY\" <= 1.0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_event_media_Zoom",
                table: "event_media",
                sql: "\"Zoom\" >= 1.0 AND \"Zoom\" <= 3.0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_event_media_FocalPointX",
                table: "event_media");

            migrationBuilder.DropCheckConstraint(
                name: "CK_event_media_FocalPointY",
                table: "event_media");

            migrationBuilder.DropCheckConstraint(
                name: "CK_event_media_Zoom",
                table: "event_media");

            migrationBuilder.DropColumn(
                name: "FocalPointX",
                table: "event_media");

            migrationBuilder.DropColumn(
                name: "FocalPointY",
                table: "event_media");

            migrationBuilder.DropColumn(
                name: "Zoom",
                table: "event_media");
        }
    }
}
