import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { aboutContent } from "../../apps/website/src/content/about.ts";
import {
  HOMEPAGE_SECTION_ORDER,
  homeContent,
  removedUnusedHomepageCopy,
} from "../../apps/website/src/content/home.ts";
import { siteContent } from "../../apps/website/src/content/site.ts";

const source = JSON.parse(
  await readFile(new URL("../../docs/content/sprint-05d-static-copy.before.json", import.meta.url)),
);

const internalCtas = {
  PrimaryCtaHref: "/events",
  SecondaryCtaHref: "/gallery",
  ContactCtaHref: "/contact",
  ReachOutCtaHref: "/contact",
};

for (const [field, expected] of Object.entries(internalCtas)) {
  const group = field === "ReachOutCtaHref" ? source.about : source.homepage;
  assert.equal(group[field], expected, `${field} is no longer the approved fixed internal route`);
  assert.match(group[field], /^\/[a-z0-9/_-]*$/i, `${field} is not a root-relative internal route`);
}

assert.deepEqual(
  {
    HeroEyebrow: homeContent.hero.eyebrow,
    HeroTitle: homeContent.hero.title,
    HeroAccent: homeContent.hero.accent,
    HeroDescription: homeContent.hero.description,
    PrimaryCtaLabel: homeContent.hero.primaryCta.label,
    PrimaryCtaHref: homeContent.hero.primaryCta.href,
    SecondaryCtaLabel: homeContent.hero.secondaryCta.label,
    SecondaryCtaHref: homeContent.hero.secondaryCta.href,
    WhyTitle: homeContent.why.title,
    WhyDescription: homeContent.why.description,
    ServicesTitle: homeContent.services.title,
    PartnersTitle: homeContent.partners.title,
    ContactTitle: homeContent.contact.title,
    ContactDescription: homeContent.contact.description,
    ContactCtaLabel: homeContent.contact.cta.label,
    ContactCtaHref: homeContent.contact.cta.href,
    StatisticsPhrase: homeContent.statistics.phrase,
    EventsTitle: homeContent.events.title,
    PreviousEventsTitle: homeContent.previousEvents.title,
    GalleryTitle: homeContent.gallery.title,
    SectionOrder: HOMEPAGE_SECTION_ORDER.join(","),
    DisabledSections: "",
    ...removedUnusedHomepageCopy,
  },
  Object.fromEntries(Object.entries(source.homepage).filter(([key]) => key !== "Id")),
  "Homepage content differs from the published export",
);

assert.deepEqual(
  {
    HeroEyebrow: aboutContent.hero.eyebrow,
    HeroHeading: aboutContent.hero.heading,
    HeroText: aboutContent.hero.text,
    IntroStatement: aboutContent.introStatement,
    StoryHeading: aboutContent.story.heading,
    StoryText: aboutContent.story.text,
    StoryHighlight: aboutContent.story.highlight,
    TeamHeading: aboutContent.team.heading,
    TeamText: aboutContent.team.text,
    PartnersHeading: aboutContent.partners.heading,
    PartnersText: aboutContent.partners.text,
    ReachOutHeading: aboutContent.reachOut.heading,
    ReachOutText: aboutContent.reachOut.text,
    ReachOutCtaLabel: aboutContent.reachOut.cta.label,
    ReachOutCtaHref: aboutContent.reachOut.cta.href,
    SeoTitle: aboutContent.seo.title,
    SeoDescription: aboutContent.seo.description,
  },
  Object.fromEntries(Object.entries(source.about).filter(([key]) => key !== "Id")),
  "About content differs from the published export",
);

assert.deepEqual(
  {
    SiteName: siteContent.name,
    BrandDescription: siteContent.brandDescription,
    DefaultSeoTitle: siteContent.defaultSeoTitle,
    DefaultSeoDescription: siteContent.defaultSeoDescription,
  },
  Object.fromEntries(Object.entries(source.branding).filter(([key]) => key !== "Id")),
  "Site content differs from the published export",
);

console.log(
  "Validated 48 exported fields, the code-owned section composition, and four fixed internal CTA destinations.",
);
