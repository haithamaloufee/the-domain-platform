"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type CountdownState =
  | { phase: "pending" }
  | { phase: "running"; value: CountdownValue }
  | { phase: "started" }
  | { phase: "ended" };

export function EventCountdown({
  startAtUtc,
  endAtUtc,
  variant = "detail",
}: {
  startAtUtc: string;
  endAtUtc?: string;
  variant?: "compact" | "detail";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<CountdownState>({ phase: "pending" });
  const startTimestamp = new Date(startAtUtc).getTime();

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "160px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const end = endAtUtc ? new Date(endAtUtc).getTime() : Number.NaN;

    function update() {
      const now = Date.now();
      const milliseconds = startTimestamp - now;
      if (milliseconds <= 0) {
        const isLive = Number.isFinite(end) && now < end;
        setState((current) => {
          const phase = isLive ? "started" : "ended";
          return current.phase === phase ? current : { phase };
        });
        return isLive;
      }

      const totalSeconds = Math.ceil(milliseconds / 1_000);
      setState({
        phase: "running",
        value: {
          days: Math.floor(totalSeconds / 86_400),
          hours: Math.floor((totalSeconds % 86_400) / 3_600),
          minutes: Math.floor((totalSeconds % 3_600) / 60),
          seconds: totalSeconds % 60,
        },
      });
      return true;
    }

    if (!update()) return;
    const interval = window.setInterval(() => {
      if (!update()) window.clearInterval(interval);
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [endAtUtc, startTimestamp, visible]);

  if (!Number.isFinite(startTimestamp)) return null;

  if (state.phase === "ended") return null;

  if (state.phase === "started") {
    return (
      <div ref={rootRef}>
        <p className="font-label text-sm uppercase tracking-[0.14em] text-gold">Happening now</p>
      </div>
    );
  }

  if (state.phase === "pending") {
    return (
      <div ref={rootRef}>
        <div
          className={
            variant === "compact" ? "h-[4.5rem] border-y border-line" : "h-24 border-y border-line"
          }
          role="status"
        >
          <span className="sr-only">Preparing event countdown</span>
        </div>
      </div>
    );
  }

  const units = [
    { label: "Days", value: state.value.days },
    { label: "Hours", value: state.value.hours },
    { label: "Minutes", value: state.value.minutes },
    { label: "Seconds", value: state.value.seconds },
  ];
  const accessibleValue = units
    .map((unit) => `${unit.value} ${unit.label.toLowerCase()}`)
    .join(", ");

  return (
    <div ref={rootRef}>
      <div
        aria-label={`Time until event starts: ${accessibleValue}`}
        className="architectural-grid grid grid-cols-4 border-y border-line bg-surface/40"
        role="timer"
      >
        {units.map((unit) => (
          <CountdownUnit key={unit.label} {...unit} compact={variant === "compact"} />
        ))}
      </div>
    </div>
  );
}

function CountdownUnit({
  compact,
  label,
  value,
}: {
  compact: boolean;
  label: string;
  value: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={
        compact
          ? "border-r border-line px-1.5 py-3 text-center last:border-r-0"
          : "border-r border-line px-2 py-5 text-center last:border-r-0 sm:px-4 sm:py-7"
      }
    >
      <span
        className={
          compact
            ? "block font-display text-xl font-bold tabular-nums text-ink"
            : "block font-display text-2xl font-bold tabular-nums text-ink sm:text-4xl"
        }
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 block font-label text-[0.5625rem] uppercase tracking-[0.1em] text-ink-muted sm:text-[0.625rem]">
        {label}
      </span>
    </div>
  );
}
