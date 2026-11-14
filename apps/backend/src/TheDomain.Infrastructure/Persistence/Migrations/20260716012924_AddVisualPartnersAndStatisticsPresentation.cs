using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVisualPartnersAndStatisticsPresentation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LogoMediaAssetId",
                table: "partners",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsStatisticsPhraseEnabled",
                table: "homepage_content",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "StatisticsPhrase",
                table: "homepage_content",
                type: "character varying(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "Moments that move with us");

            migrationBuilder.CreateIndex(
                name: "IX_partners_LogoMediaAssetId",
                table: "partners",
                column: "LogoMediaAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_partners_media_assets_LogoMediaAssetId",
                table: "partners",
                column: "LogoMediaAssetId",
                principalTable: "media_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_partners_media_assets_LogoMediaAssetId",
                table: "partners");

            migrationBuilder.DropIndex(
                name: "IX_partners_LogoMediaAssetId",
                table: "partners");

            migrationBuilder.DropColumn(
                name: "LogoMediaAssetId",
                table: "partners");

            migrationBuilder.DropColumn(
                name: "IsStatisticsPhraseEnabled",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "StatisticsPhrase",
                table: "homepage_content");
        }
    }
}
