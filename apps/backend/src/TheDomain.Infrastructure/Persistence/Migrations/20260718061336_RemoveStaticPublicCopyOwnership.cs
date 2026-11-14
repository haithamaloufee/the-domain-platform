using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheDomain.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStaticPublicCopyOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactCtaHref",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "ContactCtaLabel",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "ContactDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "ContactTitle",
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
                name: "GalleryDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "GalleryTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "HeroAccent",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "HeroDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "HeroEyebrow",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "HeroTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PartnersDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PartnersTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PreviousEventsDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PreviousEventsTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PrimaryCtaHref",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "PrimaryCtaLabel",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "SecondaryCtaHref",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "SecondaryCtaLabel",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "SectionOrder",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "ServicesDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "ServicesTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "StatisticsPhrase",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "WhyDescription",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "WhyTitle",
                table: "homepage_content");

            migrationBuilder.DropColumn(
                name: "BrandDescription",
                table: "branding_settings");

            migrationBuilder.DropColumn(
                name: "DefaultSeoDescription",
                table: "branding_settings");

            migrationBuilder.DropColumn(
                name: "DefaultSeoTitle",
                table: "branding_settings");

            migrationBuilder.DropColumn(
                name: "SiteName",
                table: "branding_settings");

            migrationBuilder.DropColumn(
                name: "HeroEyebrow",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "HeroHeading",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "HeroText",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "IntroStatement",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "PartnersHeading",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "PartnersText",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "ReachOutCtaHref",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "ReachOutCtaLabel",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "ReachOutHeading",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "ReachOutText",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "SeoDescription",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "SeoTitle",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "StoryHeading",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "StoryHighlight",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "StoryText",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "TeamHeading",
                table: "about_settings");

            migrationBuilder.DropColumn(
                name: "TeamText",
                table: "about_settings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactCtaHref",
                table: "homepage_content",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactCtaLabel",
                table: "homepage_content",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactDescription",
                table: "homepage_content",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactTitle",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.AddColumn<string>(
                name: "HeroAccent",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroDescription",
                table: "homepage_content",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HeroEyebrow",
                table: "homepage_content",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HeroTitle",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartnersDescription",
                table: "homepage_content",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartnersTitle",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

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
                name: "PrimaryCtaHref",
                table: "homepage_content",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PrimaryCtaLabel",
                table: "homepage_content",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SecondaryCtaHref",
                table: "homepage_content",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryCtaLabel",
                table: "homepage_content",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SectionOrder",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "events,statistics,why,previous,gallery,services,partners,contact");

            migrationBuilder.AddColumn<string>(
                name: "ServicesDescription",
                table: "homepage_content",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServicesTitle",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StatisticsPhrase",
                table: "homepage_content",
                type: "character varying(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "Moments that move with us");

            migrationBuilder.AddColumn<string>(
                name: "WhyDescription",
                table: "homepage_content",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WhyTitle",
                table: "homepage_content",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BrandDescription",
                table: "branding_settings",
                type: "character varying(240)",
                maxLength: 240,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DefaultSeoDescription",
                table: "branding_settings",
                type: "character varying(320)",
                maxLength: 320,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DefaultSeoTitle",
                table: "branding_settings",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SiteName",
                table: "branding_settings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HeroEyebrow",
                table: "about_settings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HeroHeading",
                table: "about_settings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HeroText",
                table: "about_settings",
                type: "character varying(700)",
                maxLength: 700,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IntroStatement",
                table: "about_settings",
                type: "character varying(700)",
                maxLength: 700,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartnersHeading",
                table: "about_settings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartnersText",
                table: "about_settings",
                type: "character varying(700)",
                maxLength: 700,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReachOutCtaHref",
                table: "about_settings",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReachOutCtaLabel",
                table: "about_settings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReachOutHeading",
                table: "about_settings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReachOutText",
                table: "about_settings",
                type: "character varying(700)",
                maxLength: 700,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SeoDescription",
                table: "about_settings",
                type: "character varying(180)",
                maxLength: 180,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoTitle",
                table: "about_settings",
                type: "character varying(70)",
                maxLength: 70,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StoryHeading",
                table: "about_settings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StoryHighlight",
                table: "about_settings",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StoryText",
                table: "about_settings",
                type: "character varying(2500)",
                maxLength: 2500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TeamHeading",
                table: "about_settings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TeamText",
                table: "about_settings",
                type: "character varying(700)",
                maxLength: 700,
                nullable: false,
                defaultValue: "");
        }
    }
}
