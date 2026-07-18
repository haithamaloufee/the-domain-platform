import { HomepageSectionKey, type PublicHomepageResponse } from "@the-domain/types";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactCtaSection } from "@/components/home/contact-cta-section";
import { FloatingVideoPlayer } from "@/components/home/floating-video-player";
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
import { HOMEPAGE_SECTION_ORDER, homeContent } from "@/content/home";
import { getPublicHomepage } from "@/lib/public-api";
import { createPageMetadata, defaultDescription, getWebsiteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Entertainment and Events in Jordan",
  description: defaultDescription,
  path: "/",
});

export default async function HomePage() {
  let data: PublicHomepageResponse | null = null;
  try {
    data = await getPublicHomepage();
  } catch {
    // The static Hero and section shells remain available when operational data is unavailable.
  }
  const presentation = data?.presentation ?? null;
  const gallery = data?.galleryPreview;
  const sections: Record<HomepageSectionKey, ReactNode> = {
    events: (
      <HomepageEventsSection
        events={data?.currentEvents ?? []}
        title={homeContent.events.title}
        unavailable={!data}
      />
    ),
    statistics: (
      <StatsSection
        motionEnabled={presentation?.statisticsMotionEnabled ?? true}
        statistics={data?.statistics ?? []}
      />
    ),
    why: <WhyDomainSection />,
    previous: (
      <PreviousEventsSection
        events={data?.previousEvents ?? []}
        title={homeContent.previousEvents.title}
        unavailable={!data}
      />
    ),
    gallery: (
      <GalleryPreviewSection
        albums={gallery?.kind === "albums" ? gallery.albums : []}
        collection={gallery?.kind === "collection" ? gallery : null}
        title={homeContent.gallery.title}
        unavailable={!data}
      />
    ),
    services: <ServicesSection />,
    partners: <PartnersPreviewSection partners={data?.partners ?? []} />,
    contact: <ContactCtaSection />,
  };
  const heroEvent = data?.currentEvents[0] ?? null;

  return (
    <>
      <JsonLd data={createHomepageStructuredData()} />
      <HomeHero featuredEvent={heroEvent} presentation={presentation} />
      {presentation?.floatingVideo && (
        <FloatingVideoPlayer
          poster={
            presentation.floatingVideo.poster?.url ?? presentation.floatingVideo.video.posterUrl
          }
          src={presentation.floatingVideo.video.url}
        />
      )}
      {HOMEPAGE_SECTION_ORDER.map((key) => (
        <CinematicReveal homeSection={key} key={key}>
          {sections[key]}
        </CinematicReveal>
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
