import { Container, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { homepageContent } from "@/content/homepage-content";
import { homeContent } from "@/content/home";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import { HomeSectionHeader } from "./home-section-header";

export function ServicesSection() {
  return (
    <Section className="border-y border-line bg-surface/45">
      <Container>
        <HomeSectionHeader eyebrow="Capabilities" title={homeContent.services.title} />
        <ol className="mt-10 border-t border-line">
          {homepageContent.services.map((service, index) => (
            <li
              className="cinematic-card grid gap-3 border-b border-line px-3 py-7 sm:grid-cols-[4rem_minmax(14rem,0.7fr)_minmax(0,1fr)] sm:items-start sm:gap-6 sm:px-5 sm:py-9"
              data-reveal="row"
              key={service.title}
            >
              <span className="font-label text-xs tracking-[0.14em] text-gold">
                <DynamicText kind="label">{String(index + 1).padStart(2, "0")}</DynamicText>
              </span>
              <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
                <DynamicText kind="heading">{service.title}</DynamicText>
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
                <DynamicText>{service.description}</DynamicText>
              </p>
            </li>
          ))}
        </ol>
        <Link className={buttonClasses("secondary", "homepage-section-cta mt-9")} href="/services">
          <DynamicText kind="action">Explore Services</DynamicText>
        </Link>
      </Container>
    </Section>
  );
}
