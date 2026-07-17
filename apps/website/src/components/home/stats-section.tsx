"use client";

import type { PublicStatisticItem, StatisticsPresentation } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homepageContent } from "@/content/homepage-content";
import { StatisticValue } from "./statistic-value";

export function StatsSection({
  statistics,
  presentation,
}: {
  statistics: PublicStatisticItem[];
  presentation: StatisticsPresentation;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [pathOffset, setPathOffset] = useState(8);
  const items = statistics.length
    ? statistics.map((statistic) => ({
        label: statistic.label,
        value: statistic.value,
        suffix: statistic.suffix,
        note: statistic.description,
      }))
    : homepageContent.statistics.map((statistic) => ({ ...statistic, suffix: null }));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const range = window.innerHeight + rect.height;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / range));
      setPathOffset(8 + progress * 28);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      aria-labelledby="homepage-statistics"
      className="statistics-stage relative isolate overflow-hidden bg-canvas"
      ref={sectionRef}
    >
      <Container className="py-section">
        <h2 className="sr-only" id="homepage-statistics">
          The Domain statistics
        </h2>
        <p className="type-eyebrow text-gold">The record</p>
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 sm:mt-16 lg:grid-cols-4 lg:gap-x-10">
          {items.map((stat, index) => (
            <div
              className="statistic-item min-w-0 text-center lg:odd:-translate-y-6 lg:even:translate-y-8"
              key={`${stat.label}-${index}`}
              style={{ "--stat-delay": `${index * 90}ms` } as CSSProperties}
            >
              <dd className="font-display text-[clamp(2.75rem,6vw,6.5rem)] font-bold leading-none tracking-[-0.055em] text-ink">
                <StatisticValue suffix={stat.suffix} value={stat.value} />
              </dd>
              <dt className="mt-3 text-sm font-medium leading-5 text-ink sm:text-base">
                {stat.label}
              </dt>
              {stat.note && <p className="mt-2 text-xs leading-5 text-ink-muted">{stat.note}</p>}
            </div>
          ))}
        </dl>
        {presentation.isEnabled && (
          <div className="mt-14 overflow-hidden sm:mt-20" aria-label={presentation.phrase}>
            <p className="type-eyebrow mb-4 text-center text-gold sm:hidden">
              {presentation.phrase}
            </p>
            <svg
              aria-hidden="true"
              className="hidden h-44 w-full overflow-visible text-gold sm:block lg:h-56"
              preserveAspectRatio="none"
              viewBox="0 0 1200 220"
            >
              <path d="M-40 22 Q600 250 1240 22" fill="none" id="statistics-curve" />
              <text className="fill-current font-label text-[24px] font-semibold uppercase tracking-[.18em]">
                <textPath href="#statistics-curve" startOffset={`${pathOffset}%`}>
                  {presentation.phrase} · {presentation.phrase} · {presentation.phrase}
                </textPath>
              </text>
            </svg>
          </div>
        )}
      </Container>
    </section>
  );
}
