import type {
  PublicEventListItem,
  GalleryPublicCollection,
  HomepageSectionKey,
  PublicGalleryAlbum,
  PublicHomepageContent,
  PublicPartner,
  PublicStatisticItem,
  StatisticsPresentation,
} from "@the-domain/types";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactCtaSection } from "@/components/home/contact-cta-section";
import { GalleryPreviewSection } from "@/components/home/gallery-preview-section";
import { HomeHero } from "@/components/home/home-hero";
import { HomepageEventsSection } from "@/components/home/homepage-events-section";
import { PartnersPreviewSection } from "@/components/home/partners-preview-section";
import { PreviousEventsSection } from "@/components/home/previous-events-section";
import { ServicesSection } from "@/components/home/services-section";
import { StatsSection } from "@/components/home/stats-section";
import { WhyDomainSection } from "@/components/home/why-domain-section";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getFeaturedEvents,
  getGalleryAlbums,
  getGalleryCollections,
  getPublicHomepage,
  getPublicPartners,
  getPublicStatistics,
  getPreviousEvents,
  getUpcomingEvents,
} from "@/lib/public-api";
import { createPageMetadata, defaultDescription, getWebsiteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Entertainment and Events in Jordan",
  description: defaultDescription,
  path: "/",
});

export const revalidate = 60;

export default async function HomePage() {
  const data = await loadHomepageData();
  const heroEvent = data.featured[0] ?? data.upcoming[0] ?? null;
  const programme = uniqueEvents([...data.featured, ...data.upcoming]).slice(0, 2);
  const builder = data.content?.builder;
  const galleryCollection =
    data.collections.find((collection) => collection.id === builder?.galleryCollectionId) ?? null;
  const sections: Record<HomepageSectionKey, ReactNode> = {
    events: (
      <HomepageEventsSection
        description={builder?.eventsDescription}
        events={programme}
        title={builder?.eventsTitle}
        unavailable={data.unavailable.events}
      />
    ),
    statistics: (
      <StatsSection statistics={data.statistics} presentation={data.statisticsPresentation} />
    ),
    why: <WhyDomainSection cmsContent={data.content} />,
    previous: (
      <PreviousEventsSection
        description={builder?.previousEventsDescription}
        events={data.previous.slice(0, 2)}
        title={builder?.previousEventsTitle}
        unavailable={data.unavailable.previous}
      />
    ),
    gallery: (
      <GalleryPreviewSection
        albums={data.albums.slice(0, 3)}
        collection={galleryCollection}
        description={builder?.galleryDescription}
        title={builder?.galleryTitle}
        unavailable={data.unavailable.gallery}
      />
    ),
    services: <ServicesSection content={data.content} />,
    partners: <PartnersPreviewSection cmsContent={data.content} partners={data.partners} />,
    contact: <ContactCtaSection cmsContent={data.content} />,
  };
  const order = builder?.sectionOrder ?? (Object.keys(sections) as HomepageSectionKey[]);
  const disabled = new Set(builder?.disabledSections ?? []);

  return (
    <>
      <JsonLd data={createHomepageStructuredData()} />
      <HomeHero content={data.content} featuredEvent={heroEvent} />
      {order
        .filter((key) => !disabled.has(key))
        .map((key) => (
          <CinematicReveal key={key}>{sections[key]}</CinematicReveal>
        ))}
    </>
  );
}

function createHomepageStructuredData(): Record<string, unknown> {
  const websiteUrl = getWebsiteUrl().toString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${websiteUrl}#organization`,
        name: siteName,
        url: websiteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${websiteUrl}#website`,
        name: siteName,
        url: websiteUrl,
        publisher: { "@id": `${websiteUrl}#organization` },
      },
    ],
  };
}

interface HomepageData {
  featured: PublicEventListItem[];
  upcoming: PublicEventListItem[];
  previous: PublicEventListItem[];
  albums: PublicGalleryAlbum[];
  collections: GalleryPublicCollection[];
  content: PublicHomepageContent | null;
  statistics: PublicStatisticItem[];
  statisticsPresentation: StatisticsPresentation;
  partners: PublicPartner[];
  unavailable: {
    events: boolean;
    previous: boolean;
    gallery: boolean;
  };
}

async function loadHomepageData(): Promise<HomepageData> {
  const [featured, upcoming, previous, albums, collections, homepage, statistics, partners] =
    await Promise.allSettled([
      getFeaturedEvents(),
      getUpcomingEvents(),
      getPreviousEvents(),
      getGalleryAlbums(),
      getGalleryCollections(),
      getPublicHomepage(),
      getPublicStatistics(),
      getPublicPartners(),
    ]);

  const homepageValue = homepage.status === "fulfilled" ? homepage.value : null;

  return {
    featured: settledValue(featured),
    upcoming: settledValue(upcoming),
    previous: settledValue(previous),
    albums: settledValue(albums),
    collections: settledValue(collections),
    content: homepageValue?.content ?? null,
    statistics:
      statistics.status === "fulfilled" ? statistics.value : (homepageValue?.statistics ?? []),
    statisticsPresentation: homepageValue?.statisticsPresentation ?? {
      phrase: "Moments that move with us",
      isEnabled: true,
    },
    partners: partners.status === "fulfilled" ? partners.value : (homepageValue?.partners ?? []),
    unavailable: {
      events: featured.status === "rejected" && upcoming.status === "rejected",
      previous: previous.status === "rejected",
      gallery: albums.status === "rejected" && collections.status === "rejected",
    },
  };
}

function settledValue<T>(result: PromiseSettledResult<T[]>): T[] {
  return result.status === "fulfilled" ? result.value : [];
}

function uniqueEvents(events: PublicEventListItem[]): PublicEventListItem[] {
  return [...new Map(events.map((event) => [event.id, event])).values()];
}
