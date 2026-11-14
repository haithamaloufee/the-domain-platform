using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaCollectionsAndArchiveWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ArchivedAtUtc",
                table: "media_assets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "media_assets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "media_collections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ArchivedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_media_collections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "media_collection_items",
                columns: table => new
                {
                    CollectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_media_collection_items", x => new { x.CollectionId, x.MediaAssetId });
                    table.ForeignKey(
                        name: "FK_media_collection_items_media_assets_MediaAssetId",
                        column: x => x.MediaAssetId,
                        principalTable: "media_assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_media_collection_items_media_collections_CollectionId",
                        column: x => x.CollectionId,
                        principalTable: "media_collections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_media_assets_IsArchived",
                table: "media_assets",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_media_collection_items_CollectionId_SortOrder",
                table: "media_collection_items",
                columns: ["CollectionId", "SortOrder"]);

            migrationBuilder.CreateIndex(
                name: "IX_media_collection_items_MediaAssetId",
                table: "media_collection_items",
                column: "MediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_media_collections_IsArchived",
                table: "media_collections",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_media_collections_Name",
                table: "media_collections",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "media_collection_items");

            migrationBuilder.DropTable(
                name: "media_collections");

            migrationBuilder.DropIndex(
                name: "IX_media_assets_IsArchived",
                table: "media_assets");

            migrationBuilder.DropColumn(
                name: "ArchivedAtUtc",
                table: "media_assets");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "media_assets");
        }
    }
}
