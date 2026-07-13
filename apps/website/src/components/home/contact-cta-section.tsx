import { Container, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { homepageContent } from "@/content/homepage-content";

export function ContactCtaSection() {
  const content = homepageContent.contact;
  return (
    <Section className="relative isolate overflow-hidden border-t border-line bg-surface">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(212,175,55,0.1),transparent_32%)]"
      />
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {content.eyebrow}
          </p>
          <h2 className="mt-5 max-w-5xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.05em] text-ink sm:text-7xl">
            {content.title}
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-8 text-ink-muted">{content.description}</p>
        </div>
        <Link className={buttonClasses("primary", "w-full sm:w-auto sm:min-w-48")} href="/contact">
          Contact The Domain
        </Link>
      </Container>
    </Section>
  );
}
