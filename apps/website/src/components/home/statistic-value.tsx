"use client";

import { useEffect, useRef, useState } from "react";

export function StatisticValue({ suffix, value }: { suffix?: string | null; value: string }) {
  const numericValue = parseNumeric(value);
  if (numericValue === null)
    return (
      <>
        {value}
        {suffix ?? ""}
      </>
    );
  return <AnimatedNumber finalValue={numericValue} source={value} suffix={suffix} />;
}

function AnimatedNumber({
  finalValue,
  source,
  suffix,
}: {
  finalValue: number;
  source: string;
  suffix?: string | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(finalValue * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [finalValue]);

  const decimals = source.includes(".") ? (source.split(".")[1]?.length ?? 0) : 0;
  const formatted = new Intl.NumberFormat("en", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    useGrouping: source.includes(","),
  }).format(displayValue);
  const finalLabel = `${source}${suffix ?? ""}`;

  return (
    <span aria-label={finalLabel} ref={ref}>
      <span aria-hidden="true" className="motion-reduce:hidden">
        {formatted}
        {suffix ?? ""}
      </span>
      <span aria-hidden="true" className="hidden motion-reduce:inline">
        {finalLabel}
      </span>
    </span>
  );
}

function parseNumeric(value: string): number | null {
  const normalized = value.replaceAll(",", "").trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
