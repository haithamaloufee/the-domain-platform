using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventBookingStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int?>(
                name: "BookingStatus",
                table: "events",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE events
                SET "BookingStatus" = CASE WHEN "IsBookingEnabled" THEN 3 ELSE 1 END;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "BookingStatus",
                table: "events",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_events_BookingStatus_Manual",
                table: "events",
                sql: "\"BookingStatus\" IN (1, 3, 4, 5)");

            migrationBuilder.DropColumn(
                name: "IsBookingEnabled",
                table: "events");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_events_BookingStatus_Manual",
                table: "events");

            migrationBuilder.AddColumn<bool>(
                name: "IsBookingEnabled",
                table: "events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                UPDATE events
                SET "IsBookingEnabled" = CASE WHEN "BookingStatus" = 3 THEN TRUE ELSE FALSE END;
                """);

            migrationBuilder.DropColumn(
                name: "BookingStatus",
                table: "events");
        }
    }
}
