using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGalleryCollectionPublishing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GalleryDescription",
                table: "media_collections",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "GalleryFeaturedMediaAssetId",
                table: "media_collections",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GalleryLayoutPreset",
                table: "media_collections",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "Editorial");

            migrationBuilder.AddColumn<int>(
                name: "GallerySortOrder",
                table: "media_collections",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "GalleryTitle",
                table: "media_collections",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublishedInGallery",
                table: "media_collections",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_media_collections_GalleryFeaturedMediaAssetId",
                table: "media_collections",
                column: "GalleryFeaturedMediaAssetId");

#pragma warning disable CA1861 // EF Core generates the composite index column array.
            migrationBuilder.CreateIndex(
                name: "IX_media_collections_IsPublishedInGallery_GallerySortOrder",
                table: "media_collections",
                columns: new[] { "IsPublishedInGallery", "GallerySortOrder" });
#pragma warning restore CA1861

            migrationBuilder.AddForeignKey(
                name: "FK_media_collections_media_assets_GalleryFeaturedMediaAssetId",
                table: "media_collections",
                column: "GalleryFeaturedMediaAssetId",
                principalTable: "media_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_media_collections_media_assets_GalleryFeaturedMediaAssetId",
                table: "media_collections");

            migrationBuilder.DropIndex(
                name: "IX_media_collections_GalleryFeaturedMediaAssetId",
                table: "media_collections");

            migrationBuilder.DropIndex(
                name: "IX_media_collections_IsPublishedInGallery_GallerySortOrder",
                table: "media_collections");

            migrationBuilder.DropColumn(
                name: "GalleryDescription",
                table: "media_collections");

            migrationBuilder.DropColumn(
                name: "GalleryFeaturedMediaAssetId",
                table: "media_collections");

            migrationBuilder.DropColumn(
                name: "GalleryLayoutPreset",
                table: "media_collections");

            migrationBuilder.DropColumn(
                name: "GallerySortOrder",
                table: "media_collections");

            migrationBuilder.DropColumn(
                name: "GalleryTitle",
                table: "media_collections");

            migrationBuilder.DropColumn(
                name: "IsPublishedInGallery",
                table: "media_collections");
        }
    }
}
