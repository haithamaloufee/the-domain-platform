using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddContextualVideoPosterPresentation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomPosterMediaAssetId",
                table: "event_media",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoPosterMode",
                table: "event_media",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "Automatic");

            migrationBuilder.AddColumn<decimal>(
                name: "VideoPosterTimestampSeconds",
                table: "event_media",
                type: "numeric(10,3)",
                precision: 10,
                scale: 3,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_event_media_CustomPosterMediaAssetId",
                table: "event_media",
                column: "CustomPosterMediaAssetId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_event_media_VideoPosterTimestampSeconds",
                table: "event_media",
                sql: "\"VideoPosterTimestampSeconds\" IS NULL OR (\"VideoPosterTimestampSeconds\" >= 0 AND \"VideoPosterTimestampSeconds\" <= 86400)");

            migrationBuilder.AddForeignKey(
                name: "FK_event_media_media_assets_CustomPosterMediaAssetId",
                table: "event_media",
                column: "CustomPosterMediaAssetId",
                principalTable: "media_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_event_media_media_assets_CustomPosterMediaAssetId",
                table: "event_media");

            migrationBuilder.DropIndex(
                name: "IX_event_media_CustomPosterMediaAssetId",
                table: "event_media");

            migrationBuilder.DropCheckConstraint(
                name: "CK_event_media_VideoPosterTimestampSeconds",
                table: "event_media");

            migrationBuilder.DropColumn(
                name: "CustomPosterMediaAssetId",
                table: "event_media");

            migrationBuilder.DropColumn(
                name: "VideoPosterMode",
                table: "event_media");

            migrationBuilder.DropColumn(
                name: "VideoPosterTimestampSeconds",
                table: "event_media");
        }
    }
}
