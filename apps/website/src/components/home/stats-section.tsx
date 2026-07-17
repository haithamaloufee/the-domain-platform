"use client";

import type { PublicStatisticItem, StatisticsPresentation } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import { useEffect, useId, useRef, useState } from "react";
import { homepageContent } from "@/content/homepage-content";

export function StatsSection({
  statistics,
  presentation,
}: {
  statistics: PublicStatisticItem[];
  presentation: StatisticsPresentation;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const fallback = homepageContent.statistics.map((item) => ({
    label: item.label,
    value: item.value,
    suffix: null,
    description: null,
  }));
  const items = Array.from({ length: 4 }, (_, index) => statistics[index] ?? fallback[index]!);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedFrame = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(reducedFrame);
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const elapsed = Math.min(1, (now - start) / 1050);
          setProgress(1 - Math.pow(1 - elapsed, 3));
          if (elapsed < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      aria-labelledby="homepage-statistics"
      className="relative isolate overflow-hidden py-section"
      ref={sectionRef}
    >
      <Container>
        <p className="type-eyebrow text-gold">The record</p>
        <h2 className="sr-only" id="homepage-statistics">
          The Domain statistics
        </h2>
        <dl className="relative z-10 mt-12 grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
          {items.map((item, index) => (
            <div
              className="grid min-w-0 text-center lg:odd:-translate-y-5 lg:even:translate-y-8"
              key={`${index}-${item.label}`}
            >
              <dt className="order-2 mt-3 text-sm font-semibold leading-5 text-ink sm:text-base">
                {item.label}
              </dt>
              <dd className="order-1 text-[clamp(3rem,7vw,7rem)] font-extrabold leading-none tracking-[-.06em] text-ink">
                {formatStatistic(item.value, progress)}
                {item.suffix}
              </dd>
            </div>
          ))}
        </dl>
        {presentation.isEnabled && <ScrollTextPath phrase={presentation.phrase} />}
      </Container>
    </section>
  );
}

function ScrollTextPath({ phrase }: { phrase: string }) {
  const id = useId().replaceAll(":", "");
  const textRef = useRef<SVGTextElement>(null);
  const pathRef = useRef<SVGTextPathElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = window.scrollY;
    let velocity = 0;
    let target = 0;
    let offset = 0;
    let frame = 0;
    let unit = 420;
    const measure = () => {
      unit = Math.max(1, (textRef.current?.getComputedTextLength() ?? 2520) / 6);
    };
    const tick = () => {
      velocity += (target - velocity) * 0.2;
      target *= 0.78;
      offset = (((offset + velocity) % unit) + unit) % unit;
      pathRef.current?.setAttribute("startOffset", `${-offset}px`);
      if (Math.abs(velocity) < 0.015 && Math.abs(target) < 0.015) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const scroll = () => {
      const current = window.scrollY;
      target = Math.max(-7, Math.min(7, (current - lastY) * 0.28));
      lastY = current;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(measure);
    if (textRef.current) resize.observe(textRef.current);
    measure();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  const repeated = Array.from({ length: 6 }, () => `${phrase} · `).join("");
  return (
    <div className="relative z-0 -mx-gutter mt-8 h-40 sm:mt-10 sm:h-56">
      <span className="sr-only">{phrase}</span>
      <svg
        aria-hidden="true"
        className="h-full w-full overflow-visible text-gold"
        preserveAspectRatio="none"
        viewBox="0 0 1200 220"
      >
        <path d="M-260 28 C130 250 410 250 620 120 C820 -5 1060 -5 1460 185" fill="none" id={id} />
        <text
          className="fill-current text-[clamp(1.15rem,2.3vw,2rem)] font-semibold uppercase tracking-[.17em]"
          ref={textRef}
        >
          <textPath href={`#${id}`} ref={pathRef}>
            {repeated}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

function formatStatistic(value: string, progress: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  const decimals = value.includes(".") ? (value.split(".")[1]?.length ?? 0) : 0;
  return (numeric * progress).toFixed(decimals);
}
