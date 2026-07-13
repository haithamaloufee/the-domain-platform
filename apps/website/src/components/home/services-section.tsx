import type { PublicHomepageContent } from "@the-domain/types";
import { Container, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { homepageContent } from "@/content/homepage-content";
import { HomeSectionHeader } from "./home-section-header";

export function ServicesSection({ content }: { content: PublicHomepageContent | null }) {
  return (
    <Section className="border-y border-line bg-surface/45">
      <Container>
        <HomeSectionHeader
          description={
            content?.servicesDescription ??
            "A flexible service framework for public, corporate, and private briefs. Detailed service content remains locally editable until its CMS module is introduced."
          }
          eyebrow="Capabilities"
          title={content?.servicesTitle ?? "From first idea to final atmosphere."}
        />
        <ol className="mt-10 border-t border-line">
          {homepageContent.services.map((service, index) => (
            <li
              className="cinematic-card grid gap-3 border-b border-line px-3 py-7 sm:grid-cols-[4rem_minmax(14rem,0.7fr)_minmax(0,1fr)] sm:items-start sm:gap-6 sm:px-5 sm:py-9"
              key={service.title}
            >
              <span className="font-label text-xs tracking-[0.14em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
                {service.title}
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
                {service.description}
              </p>
            </li>
          ))}
        </ol>
        <Link className={buttonClasses("secondary", "mt-9")} href="/services">
          Explore Services
        </Link>
      </Container>
    </Section>
  );
}
