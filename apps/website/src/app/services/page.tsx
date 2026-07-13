import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, buttonClasses } from "@the-domain/ui";
import { RouteIntro } from "@/components/layout/route-intro";
import { homepageContent } from "@/content/homepage-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Entertainment and Event Services",
  description:
    "Explore The Domain's event management, corporate entertainment, production, and private experience capabilities.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <RouteIntro
        eyebrow="Capabilities"
        title="Services"
        description="From concept and production through to the final guest experience, The Domain brings the disciplines behind memorable entertainment into one considered direction."
        actionHref="/contact"
        actionLabel="Start a conversation"
      />
      <Section className="cinematic-reveal border-b border-line">
        <Container>
          <ol className="divide-y divide-line border-y border-line">
            {homepageContent.services.map((service, index) => (
              <li
                className="cinematic-card grid gap-5 px-4 py-8 sm:grid-cols-[4rem_1fr] sm:px-6 lg:py-10"
                key={service.title}
              >
                <span className="font-label text-xs tracking-[0.18em] text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-ink-muted">{service.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link className={buttonClasses("secondary", "mt-10")} href="/contact">
            Discuss a project
          </Link>
        </Container>
      </Section>
    </>
  );
}
