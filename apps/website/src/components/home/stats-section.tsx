import { Container } from "@the-domain/ui";
import { homepageContent } from "@/content/homepage-content";

export function StatsSection() {
  return (
    <section aria-labelledby="homepage-statistics" className="border-y border-line bg-surface/45">
      <Container className="py-12 sm:py-16">
        <h2 className="sr-only" id="homepage-statistics">
          The Domain statistics
        </h2>
        <p className="mb-8 font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          The record
        </p>
        <dl className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
          {homepageContent.statistics.map((stat) => (
            <div className="border-b border-r border-line p-5 sm:p-7" key={stat.label}>
              <dt className="font-label text-xs uppercase tracking-[0.14em] text-ink">
                {stat.label}
              </dt>
              <dd className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">
                {stat.value}
              </dd>
              <p className="mt-2 text-xs leading-5 text-ink-muted">{stat.note}</p>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
