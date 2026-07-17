"use client";

import type { PublicStatisticItem, StatisticsPresentation } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import { useEffect, useRef } from "react";
import { homepageContent } from "@/content/homepage-content";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import { ScrollSnakeText } from "./scroll-snake-text";

export function StatsSection({
  statistics,
  presentation,
}: {
  statistics: PublicStatisticItem[];
  presentation: StatisticsPresentation;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const fallback = homepageContent.statistics.map((item) => ({
    label: item.label,
    value: item.value,
    suffix: item.suffix,
    description: null,
  }));
  const items = Array.from({ length: 4 }, (_, index) => statistics[index] ?? fallback[index]!);
  const valueSignature = items.map((item) => item.value).join("|");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      observer.disconnect();
      const sourceValues = valueSignature.split("|");
      const numbers = sourceValues.map((value) => Number(value));
      const valid = numbers.every(Number.isFinite);
      if (!valid) return;
      const startedAt = performance.now();
      const duration = 820;
      numberRefs.current.forEach((element) => {
        if (element) updateVisibleNumber(element, "0", element.dataset.source ?? "0");
      });
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        numbers.forEach((value, index) => {
          const element = numberRefs.current[index];
          if (element)
            updateVisibleNumber(
              element,
              formatNumber(value * eased, sourceValues[index]!),
              sourceValues[index]!,
            );
        });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else
          numberRefs.current.forEach((element, index) => {
            if (element) updateVisibleNumber(element, sourceValues[index]!, sourceValues[index]!);
          });
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    observer.observe(section);
    const bounds = section.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) start();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [valueSignature]);

  return (
    <section
      aria-labelledby="homepage-statistics"
      className="relative isolate overflow-hidden py-section"
      ref={sectionRef}
    >
      <Container>
        <p className="type-eyebrow text-gold" data-reveal="label">
          <DynamicText kind="label">The record</DynamicText>
        </p>
        <h2 className="sr-only" id="homepage-statistics">
          The Domain statistics
        </h2>
        <div className="relative mt-8 min-h-[31rem] sm:min-h-[38rem] lg:min-h-[43rem]">
          {presentation.isEnabled && <ScrollSnakeText phrase={presentation.phrase} />}
          <dl className="relative z-10 grid grid-cols-2 items-start gap-x-6 gap-y-12 pt-9 sm:gap-x-10 sm:gap-y-16 lg:grid-cols-4 lg:gap-x-8 lg:pt-28">
            {items.map((item, index) => (
              <div
                className="statistic-composition-item flex min-h-40 min-w-0 flex-col items-center justify-start text-center sm:min-h-48"
                data-reveal="statistic"
                key={`${index}-${item.label}`}
              >
                <dt className="order-2 mt-3 max-w-[14rem] text-sm font-semibold leading-5 text-ink sm:text-base">
                  <DynamicText kind="label">{item.label}</DynamicText>
                </dt>
                <dd
                  aria-label={`${item.value}${item.suffix ?? ""}`}
                  className="order-1 whitespace-nowrap text-[clamp(3.75rem,7.2vw,8.5rem)] font-extrabold leading-none tracking-[-.065em] text-ink"
                >
                  <span
                    aria-hidden="true"
                    data-source={item.value}
                    ref={(element) => {
                      numberRefs.current[index] = element;
                    }}
                  >
                    <DynamicText kind="statistic">{item.value}</DynamicText>
                  </span>
                  {item.suffix && (
                    <span aria-hidden="true" className="tracking-[-.04em]">
                      {item.suffix}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

function formatNumber(value: number, source: string) {
  const decimals = source.includes(".") ? (source.split(".")[1]?.length ?? 0) : 0;
  return value.toFixed(decimals);
}

function updateVisibleNumber(element: HTMLElement, value: string, source: string) {
  const glyphs = Array.from(element.querySelectorAll<HTMLElement>(".dynamic-text__glyph"));
  const characters = value.padStart(source.length, "0").slice(-source.length);
  glyphs.forEach((glyph, index) => {
    glyph.textContent = characters[index] ?? "0";
  });
}
