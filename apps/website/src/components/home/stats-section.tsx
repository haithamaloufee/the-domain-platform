"use client";

import type { PublicStatisticItem, StatisticsPresentation } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import { useEffect, useRef } from "react";
import { homepageContent } from "@/content/homepage-content";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import {
  countUpDurationMs,
  easeOutCubic,
  formatStatisticValue,
  parseStatisticTarget,
  statisticFinalLabel,
} from "@/lib/homepage-ux";
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
  const hasCountedRef = useRef(false);
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
    if (!section) return;
    let frame = 0;
    let observer: IntersectionObserver | null = null;
    const sourceValues = valueSignature.split("|");
    const targets = sourceValues.map(parseStatisticTarget);

    const showFinalValues = () => {
      numberRefs.current.forEach((element, index) => {
        if (!element) return;
        updateVisibleNumber(element, sourceValues[index] ?? "0");
        element.dataset.counting = "false";
        element.dataset.countComplete = "true";
      });
    };

    if (
      hasCountedRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window) ||
      targets.some((target) => target === null)
    ) {
      showFinalValues();
      return;
    }

    const start = () => {
      if (hasCountedRef.current) return;
      hasCountedRef.current = true;
      observer?.disconnect();
      const startedAt = performance.now();
      numberRefs.current.forEach((element) => {
        if (!element) return;
        updateVisibleNumber(element, formatStatisticValue(0, element.dataset.statTarget ?? "0"));
        element.dataset.counting = "true";
        element.dataset.countComplete = "false";
      });
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / countUpDurationMs);
        const eased = easeOutCubic(progress);
        targets.forEach((target, index) => {
          const element = numberRefs.current[index];
          const source = sourceValues[index];
          if (element && target !== null && source)
            updateVisibleNumber(element, formatStatisticValue(target * eased, source));
        });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else showFinalValues();
      };
      frame = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    observer.observe(section);
    const bounds = section.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) start();
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [valueSignature]);

  return (
    <section
      aria-labelledby="homepage-statistics"
      className="relative isolate overflow-hidden py-section"
      ref={sectionRef}
    >
      <Container className="px-[clamp(.5rem,2.5vw,2rem)]">
        <p className="type-eyebrow text-gold" data-reveal="label">
          <DynamicText kind="label">The record</DynamicText>
        </p>
        <h2 className="sr-only" id="homepage-statistics">
          The Domain statistics
        </h2>
        <div className="relative mt-8 min-h-[22rem] sm:min-h-[28rem] lg:min-h-[30rem]">
          {presentation.isEnabled && <ScrollSnakeText phrase={presentation.phrase} />}
          <dl className="relative z-10 grid grid-cols-4 items-start gap-x-[clamp(.25rem,1.5vw,2rem)] pt-14 sm:pt-20 lg:pt-24">
            {items.map((item, index) => (
              <div
                className="statistic-composition-item flex min-w-0 flex-col items-center justify-start text-center"
                data-reveal="statistic"
                key={`${index}-${item.label}`}
              >
                <dt className="order-2 mt-2 max-w-[14rem] break-words text-[clamp(.625rem,2.2vw,1rem)] font-semibold leading-[1.25] text-ink [overflow-wrap:anywhere] sm:mt-3">
                  <DynamicText kind="label">{item.label}</DynamicText>
                </dt>
                <dd
                  aria-label={statisticFinalLabel(item.value, item.suffix)}
                  className="order-1 min-w-0 whitespace-nowrap text-[clamp(1.45rem,7.2vw,8.5rem)] font-extrabold leading-none tracking-[-.065em] text-ink"
                >
                  <span
                    aria-hidden="true"
                    data-count-complete="false"
                    data-counting="false"
                    data-stat-current={item.value}
                    data-stat-target={item.value}
                    ref={(element) => {
                      numberRefs.current[index] = element;
                    }}
                  >
                    <DynamicText kind="statistic">{item.value}</DynamicText>
                  </span>
                  {item.suffix && (
                    <span
                      aria-hidden="true"
                      className="inline-block align-[.16em] text-[.58em] tracking-[-.04em]"
                    >
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

function updateVisibleNumber(element: HTMLElement, value: string) {
  const target = element.querySelector<HTMLElement>(".dynamic-text");
  if (!target) return;
  target.textContent = value;
  element.dataset.statCurrent = value;
}
