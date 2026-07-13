import type { PublicStatisticItem } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import { homepageContent } from "@/content/homepage-content";
import { StatisticValue } from "./statistic-value";

export function StatsSection({ statistics }: { statistics: PublicStatisticItem[] }) {
  const items = statistics.length
    ? statistics.map((statistic) => ({
        label: statistic.label,
        value: statistic.value,
        suffix: statistic.suffix,
        note: statistic.description,
      }))
    : homepageContent.statistics.map((statistic) => ({ ...statistic, suffix: null }));

  return (
    <section
      aria-labelledby="homepage-statistics"
      className="relative isolate overflow-hidden border-y border-line bg-surface/45"
    >
      <div aria-hidden="true" className="architectural-grid absolute inset-0 -z-10 opacity-20" />
      <Container className="py-12 sm:py-16">
        <h2 className="sr-only" id="homepage-statistics">
          The Domain statistics
        </h2>
        <p className="mb-8 font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          The record
        </p>
        <dl className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
          {items.map((stat) => (
            <div
              className="group border-b border-r border-line p-5 transition-colors hover:bg-surface-raised/55 sm:p-7"
              key={stat.label}
            >
              <dt className="font-label text-xs uppercase tracking-[0.14em] text-ink">
                {stat.label}
              </dt>
              <dd className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">
                <StatisticValue suffix={stat.suffix} value={stat.value} />
              </dd>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                {stat.note || "Verified by The Domain"}
              </p>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
