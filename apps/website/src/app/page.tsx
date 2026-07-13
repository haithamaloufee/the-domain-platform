import type { PublicEventListItem, PublicGalleryAlbum } from "@the-domain/types";
import { ContactCtaSection } from "@/components/home/contact-cta-section";
import { GalleryPreviewSection } from "@/components/home/gallery-preview-section";
import { HomeHero } from "@/components/home/home-hero";
import { HomepageEventsSection } from "@/components/home/homepage-events-section";
import { PartnersPreviewSection } from "@/components/home/partners-preview-section";
import { PreviousEventsSection } from "@/components/home/previous-events-section";
import { ServicesSection } from "@/components/home/services-section";
import { StatsSection } from "@/components/home/stats-section";
import { WhyDomainSection } from "@/components/home/why-domain-section";
import {
  getFeaturedEvents,
  getGalleryAlbums,
  getPreviousEvents,
  getUpcomingEvents,
} from "@/lib/public-api";

export const revalidate = 60;

export default async function HomePage() {
  const data = await loadHomepageData();
  const heroEvent = data.featured[0] ?? data.upcoming[0] ?? null;
  const programme = uniqueEvents([...data.featured, ...data.upcoming]).slice(0, 2);

  return (
    <>
      <HomeHero featuredEvent={heroEvent} />
      <HomepageEventsSection events={programme} unavailable={data.unavailable.events} />
      <StatsSection />
      <WhyDomainSection />
      <PreviousEventsSection
        events={data.previous.slice(0, 2)}
        unavailable={data.unavailable.previous}
      />
      <GalleryPreviewSection
        albums={data.albums.slice(0, 3)}
        unavailable={data.unavailable.gallery}
      />
      <ServicesSection />
      <PartnersPreviewSection />
      <ContactCtaSection />
    </>
  );
}

interface HomepageData {
  featured: PublicEventListItem[];
  upcoming: PublicEventListItem[];
  previous: PublicEventListItem[];
  albums: PublicGalleryAlbum[];
  unavailable: {
    events: boolean;
    previous: boolean;
    gallery: boolean;
  };
}

async function loadHomepageData(): Promise<HomepageData> {
  const [featured, upcoming, previous, albums] = await Promise.allSettled([
    getFeaturedEvents(),
    getUpcomingEvents(),
    getPreviousEvents(),
    getGalleryAlbums(),
  ]);

  return {
    featured: settledValue(featured),
    upcoming: settledValue(upcoming),
    previous: settledValue(previous),
    albums: settledValue(albums),
    unavailable: {
      events: featured.status === "rejected" && upcoming.status === "rejected",
      previous: previous.status === "rejected",
      gallery: albums.status === "rejected",
    },
  };
}

function settledValue<T>(result: PromiseSettledResult<T[]>): T[] {
  return result.status === "fulfilled" ? result.value : [];
}

function uniqueEvents(events: PublicEventListItem[]): PublicEventListItem[] {
  return [...new Map(events.map((event) => [event.id, event])).values()];
}
