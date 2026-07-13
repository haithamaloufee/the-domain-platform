import { Container, Section } from "@the-domain/ui";
import { homepageContent } from "@/content/homepage-content";

export function PartnersPreviewSection() {
  const content = homepageContent.partners;
  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">
            {content.title}
          </h2>
        </div>
        <div className="border-l border-line pl-6 lg:col-span-5 lg:pl-9">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
            Data-ready section
          </p>
          <p className="mt-4 max-w-lg text-sm leading-7 text-ink-muted sm:text-base">
            {content.emptyMessage}
          </p>
        </div>
      </Container>
    </Section>
  );
}
