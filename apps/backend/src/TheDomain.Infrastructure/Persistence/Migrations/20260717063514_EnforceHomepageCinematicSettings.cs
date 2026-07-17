using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnforceHomepageCinematicSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SlotNumber",
                table: "homepage_statistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FloatingVideoMediaAssetId",
                table: "homepage_content",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FloatingVideoPosterMediaAssetId",
                table: "homepage_content",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFloatingVideoEnabled",
                table: "homepage_content",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                WITH ranked AS (
                    SELECT "Id", ROW_NUMBER() OVER (ORDER BY "SortOrder", "CreatedAtUtc", "Id") AS slot
                    FROM homepage_statistics
                )
                UPDATE homepage_statistics AS statistics
                SET "SlotNumber" = ranked.slot,
                    "SortOrder" = ranked.slot - 1,
                    "IsVisible" = TRUE,
                    "IsVerified" = TRUE
                FROM ranked
                WHERE statistics."Id" = ranked."Id" AND ranked.slot <= 4;

                UPDATE homepage_statistics
                SET "Suffix" = COALESCE(
                        NULLIF(BTRIM("Suffix"), ''),
                        NULLIF(substring(BTRIM("Value") from '([A-Za-z%+]+)$'), '')
                    ),
                    "Value" = regexp_replace(BTRIM("Value"), '([A-Za-z%+]+)$', '')
                WHERE "SlotNumber" IS NOT NULL;

                UPDATE homepage_statistics
                SET "Value" = '0'
                WHERE "SlotNumber" IS NOT NULL
                  AND "Value" !~ '^[+-]?[0-9]+([.][0-9]+)?$';

                INSERT INTO homepage_statistics
                    ("Id", "Label", "Value", "Suffix", "Description", "SortOrder", "SlotNumber",
                     "IsVisible", "IsVerified", "CreatedAtUtc", "UpdatedAtUtc")
                SELECT seed.id, seed.label, seed.value, seed.suffix, NULL, seed.slot - 1, seed.slot,
                       TRUE, TRUE, NOW(), NOW()
                FROM (VALUES
                    ('2ad7c06a-d701-4e7e-a46f-15c753e9b011'::uuid, 1, 'Years of experience', '10', '+'),
                    ('2ad7c06a-d701-4e7e-a46f-15c753e9b012'::uuid, 2, 'Events produced', '75', '+'),
                    ('2ad7c06a-d701-4e7e-a46f-15c753e9b013'::uuid, 3, 'Guests welcomed', '120', 'K'),
                    ('2ad7c06a-d701-4e7e-a46f-15c753e9b014'::uuid, 4, 'Creative partners', '25', '+')
                ) AS seed(id, slot, label, value, suffix)
                WHERE NOT EXISTS (
                    SELECT 1 FROM homepage_statistics existing WHERE existing."SlotNumber" = seed.slot
                );
                """);

            migrationBuilder.CreateIndex(
                name: "IX_homepage_statistics_SlotNumber",
                table: "homepage_statistics",
                column: "SlotNumber",
                unique: true,
                filter: "\"SlotNumber\" IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "ck_homepage_statistics_slot",
                table: "homepage_statistics",
                sql: "\"SlotNumber\" IS NULL OR (\"SlotNumber\" >= 1 AND \"SlotNumber\" <= 4)");

            migrationBuilder.CreateIndex(
                name: "IX_homepage_content_FloatingVideoMediaAssetId",
                table: "homepage_content",
                column: "FloatingVideoMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_homepage_content_FloatingVideoPosterMediaAssetId",
                table: "homepage_content",
                column: "FloatingVideoPosterMediaAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_homepage_content_media_assets_FloatingVideoMediaAssetId",
                table: "homepage_content",
                column: "FloatingVideoMediaAssetId",
                principalTable: "media_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_homepage_content_media_assets_FloatingVideoPosterMediaAsset~",
                table: "homepage_content",
                column: "FloatingVideoPosterMediaAssetId",
                principalTable: "media_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_homepage_content_media_assets_FloatingVideoMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropForeignKey(
                name: "FK_homepage_content_media_assets_FloatingVideoPosterMediaAsset~",
                table: "homepage_content");

            migrationBuilder.DropIndex(
                name: "IX_homepage_statistics_SlotNumber",
                table: "homepage_statistics");

            migrationBuilder.DropCheckConstraint(
                name: "ck_homepage_statistics_slot",
                table: "homepage_statistics");

            migrationBuilder.DropIndex(
                name: "IX_homepage_content_FloatingVideoMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropIndex(
                name: "IX_homepage_content_FloatingVideoPosterMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "SlotNumber",
                table: "homepage_statistics");

            migrationBuilder.DropColumn(
                name: "FloatingVideoMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "FloatingVideoPosterMediaAssetId",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "IsFloatingVideoEnabled",
                table: "homepage_content");
        }
    }
}
