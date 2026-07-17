"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const edge = 12;

export function FloatingVideoPlayer({ src, poster }: { src: string; poster?: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [closed, setClosed] = useState(false);
  const [position, setPosition] = useState({ x: edge, y: edge });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [progress, setProgress] = useState(0);

  const clamp = useCallback((x: number, y: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 176;
    const height = rect?.height ?? 320;
    return {
      x: Math.min(Math.max(edge, x), Math.max(edge, window.innerWidth - width - edge)),
      y: Math.min(Math.max(edge, y), Math.max(edge, window.innerHeight - height - edge)),
    };
  }, []);

  useEffect(() => {
    const place = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      setPosition((current) =>
        current.x === edge && current.y === edge
          ? clamp(
              window.innerWidth - (rect?.width ?? 176) - 22,
              window.innerHeight - (rect?.height ?? 320) - 22,
            )
          : clamp(current.x, current.y),
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("orientationchange", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("orientationchange", place);
    };
  }, [clamp]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => setPlaying(true))
      .catch(() => setAutoplayBlocked(true));
  }, []);

  if (closed) return null;

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div
      aria-label="Floating video player"
      className="fixed z-40 w-[clamp(10.5rem,18vw,14rem)] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_1rem_4rem_rgb(0_0_0/.55)]"
      ref={rootRef}
      style={{ left: position.x, top: position.y }}
    >
      <div
        aria-label="Drag video player"
        className="flex h-8 touch-none cursor-grab items-center justify-between bg-black/90 px-3 text-[.6rem] uppercase tracking-[.15em] text-white/70 active:cursor-grabbing"
        onPointerDown={(event) => {
          dragRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            left: position.x,
            top: position.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          setPosition(clamp(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y));
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <span>Drag</span>
        <span aria-hidden="true">...</span>
      </div>
      <div className="relative aspect-[9/16] bg-black">
        <video
          className="h-full w-full object-cover"
          loop
          muted={muted}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
          }}
          playsInline
          poster={poster ?? undefined}
          preload="metadata"
          ref={videoRef}
          src={src}
        />
        {autoplayBlocked && (
          <button
            className="absolute inset-0 grid place-items-center bg-black/35 text-sm font-bold text-white"
            onClick={() => void togglePlay()}
            type="button"
          >
            Play video
          </button>
        )}
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-black/94 p-2 text-white">
        <button
          aria-label={playing ? "Pause video" : "Play video"}
          className="min-h-11 min-w-11 text-xs"
          onClick={() => void togglePlay()}
          type="button"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="min-h-11 rounded-full bg-gold px-3 text-xs font-extrabold text-black"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            video.muted = !muted;
            setMuted(!muted);
          }}
          type="button"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          aria-label="Close floating video"
          className="min-h-11 min-w-11 text-lg"
          onClick={() => setClosed(true)}
          type="button"
        >
          X
        </button>
        <input
          aria-label="Video progress"
          className="col-span-3 h-5 w-full accent-[var(--td-color-gold)]"
          max={100}
          min={0}
          onChange={(event) => {
            const video = videoRef.current;
            if (video?.duration)
              video.currentTime = (Number(event.target.value) / 100) * video.duration;
          }}
          type="range"
          value={progress}
        />
      </div>
    </div>
  );
}
