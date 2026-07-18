"use client";

import { useEffect, useRef, useState } from "react";

export function HeroBackgroundVideo({ poster, src }: { poster?: string; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [deferredSource, setDeferredSource] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (preference.matches || connection?.saveData) return;
    const activate = () => {
      const idle = window.requestIdleCallback?.bind(window);
      if (idle) idle(() => setDeferredSource(src), { timeout: 1800 });
      else globalThis.setTimeout(() => setDeferredSource(src), 700);
    };
    if (document.readyState === "complete") activate();
    else window.addEventListener("load", activate, { once: true });
    return () => window.removeEventListener("load", activate);
  }, [src]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !deferredSource) return;
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, [deferredSource]);

  return (
    <video
      aria-hidden="true"
      className={`cinematic-media absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      loop
      muted
      playsInline
      poster={poster}
      preload={deferredSource ? "metadata" : "none"}
      ref={ref}
      src={deferredSource ?? undefined}
      onCanPlay={() => setReady(true)}
    />
  );
}
