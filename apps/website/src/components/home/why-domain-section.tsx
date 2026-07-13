import { Container, Section } from "@the-domain/ui";
import { homepageContent } from "@/content/homepage-content";

export function WhyDomainSection() {
  const content = homepageContent.whyDomain;
  return (
    <Section>
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {content.eyebrow}
          </p>
          <div aria-hidden="true" className="mt-7 h-px w-20 bg-gold" />
        </div>
        <div className="lg:col-span-8">
          <h2 className="max-w-4xl font-display text-4xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-6xl">
            {content.title}
          </h2>
          <div className="mt-9 grid gap-6 text-base leading-8 text-ink-muted sm:grid-cols-2">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
