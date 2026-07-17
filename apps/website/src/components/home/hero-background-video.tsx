"use client";

import { useEffect, useRef } from "react";

export function HeroBackgroundVideo({ poster, src }: { poster?: string; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!video || preference.matches) return;
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, []);

  return (
    <video
      aria-hidden="true"
      className="cinematic-media absolute inset-0 -z-20 h-full w-full object-cover"
      loop
      muted
      playsInline
      poster={poster}
      preload="metadata"
      ref={ref}
      src={src}
    />
  );
}
