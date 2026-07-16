using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVisualHomepageBuilder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisabledSections",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EventsDescription",
                table: "homepage_content",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "The next Domain experiences.");

            migrationBuilder.AddColumn<string>(
                name: "EventsTitle",
                table: "homepage_content",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                defaultValue: "Upcoming experiences");

            migrationBuilder.AddColumn<Guid>(
                name: "GalleryCollectionId",
                table: "homepage_content",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GalleryDescription",
                table: "homepage_content",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "Curated photography and film from The Domain.");

            migrationBuilder.AddColumn<string>(
                name: "GalleryTitle",
                table: "homepage_content",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                defaultValue: "Gallery highlights");

            migrationBuilder.AddColumn<Guid>(
                name: "HeroMediaAssetId",
                table: "homepage_content",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviousEventsDescription",
                table: "homepage_content",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "Moments that continue to shape The Domain.");

            migrationBuilder.AddColumn<string>(
                name: "PreviousEventsTitle",
                table: "homepage_content",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                defaultValue: "Previous events");

            migrationBuilder.AddColumn<string>(
                name: "SectionOrder",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "events,statistics,why,previous,gallery,services,partners,contact");

            migrationBuilder.CreateIndex(
                name: "IX_homepage_content_GalleryCollectionId",
                table: "homepage_content",
                column: "GalleryCollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_homepage_content_HeroMediaAssetId",
                table: "homepage_content",
                column: "HeroMediaAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_homepage_content_media_assets_HeroMediaAssetId",
                table: "homepage_content",
                column: "HeroMediaAssetId",
                principalTable: "media_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_homepage_content_media_collections_GalleryCollectionId",
                table: "homepage_content",
                column: "GalleryCollectionId",
                principalTable: "media_collections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_homepage_content_media_assets_HeroMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropForeignKey(
                name: "FK_homepage_content_media_collections_GalleryCollectionId",
                table: "homepage_content");

            migrationBuilder.DropIndex(
                name: "IX_homepage_content_GalleryCollectionId",
                table: "homepage_content");

            migrationBuilder.DropIndex(
                name: "IX_homepage_content_HeroMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "DisabledSections",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "EventsDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "EventsTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "GalleryCollectionId",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "GalleryDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "GalleryTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "HeroMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PreviousEventsDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PreviousEventsTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "SectionOrder",
                table: "homepage_content");
        }
    }
}
