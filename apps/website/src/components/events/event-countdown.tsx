"use client";

import { useEffect, useState } from "react";

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function EventCountdown({ startAtUtc }: { startAtUtc: string }) {
  const [remaining, setRemaining] = useState<CountdownValue | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const start = new Date(startAtUtc).getTime();
    function update() {
      const milliseconds = start - Date.now();
      if (milliseconds <= 0) {
        setStarted(true);
        setRemaining(null);
        return false;
      }
      const totalSeconds = Math.floor(milliseconds / 1_000);
      setRemaining({
        days: Math.floor(totalSeconds / 86_400),
        hours: Math.floor((totalSeconds % 86_400) / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
        seconds: totalSeconds % 60,
      });
      return true;
    }

    if (!update()) return;
    const interval = window.setInterval(() => {
      if (!update()) window.clearInterval(interval);
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [startAtUtc]);

  if (started) {
    return (
      <p className="font-label text-sm uppercase tracking-[0.14em] text-gold">Event has started</p>
    );
  }

  if (!remaining) {
    return (
      <div className="h-20 animate-pulse border-y border-line" role="status">
        <span className="sr-only">Loading event countdown</span>
      </div>
    );
  }

  return (
    <div
      aria-label="Time until event starts"
      className="architectural-grid grid grid-cols-4 border-y border-line bg-surface/40"
    >
      <CountdownUnit label="Days" value={remaining.days} />
      <CountdownUnit label="Hours" value={remaining.hours} />
      <CountdownUnit label="Minutes" value={remaining.minutes} />
      <CountdownUnit label="Seconds" value={remaining.seconds} />
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-line px-2 py-5 text-center last:border-r-0 sm:px-4 sm:py-7">
      <span className="block font-display text-2xl font-bold tabular-nums text-ink sm:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 block font-label text-[0.625rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}
