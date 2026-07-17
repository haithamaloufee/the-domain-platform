"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";

const safeGap = 16;

interface Point {
  x: number;
  y: number;
}

export function FloatingVideoPlayer({ src, poster }: { src: string; poster?: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const positionRef = useRef<Point>({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [closed, setClosed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [progress, setProgress] = useState(0);

  const applyPosition = useCallback((point: Point) => {
    const root = rootRef.current;
    if (!root) return;
    const bounds = root.getBoundingClientRect();
    const x = Math.min(
      Math.max(safeGap, point.x),
      Math.max(safeGap, window.innerWidth - bounds.width - safeGap),
    );
    const headerBottom =
      document.querySelector<HTMLElement>("[data-site-header]")?.getBoundingClientRect().bottom ??
      0;
    const minimumY = Math.max(safeGap, headerBottom + safeGap);
    const y = Math.min(
      Math.max(minimumY, point.y),
      Math.max(minimumY, window.innerHeight - bounds.height - safeGap),
    );
    positionRef.current = { x, y };
    root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    root.style.visibility = "visible";
  }, []);

  const placeAtInitialPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const bounds = root.getBoundingClientRect();
    const headerBottom =
      document.querySelector<HTMLElement>("[data-site-header]")?.getBoundingClientRect().bottom ??
      0;
    applyPosition({
      x: window.innerWidth - bounds.width - safeGap,
      y: headerBottom + safeGap,
    });
    initializedRef.current = true;
  }, [applyPosition]);

  useLayoutEffect(() => {
    placeAtInitialPosition();
    const reposition = () => {
      requestAnimationFrame(() => {
        if (initializedRef.current) applyPosition(positionRef.current);
        else placeAtInitialPosition();
      });
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("orientationchange", reposition);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("orientationchange", reposition);
    };
  }, [applyPosition, placeAtInitialPosition]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video
      .play()
      .then(() => setPlaying(true))
      .catch(() => setAutoplayBlocked(true));
  }, []);

  if (closed) return null;

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }

  async function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) {
      try {
        await video.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    }
  }

  return (
    <div
      aria-label="Floating video player"
      className="fixed left-0 top-0 z-40 w-[clamp(10rem,18vw,13.5rem)] overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_1.25rem_4rem_rgb(0_0_0/.58)]"
      ref={rootRef}
      style={{ transform: "translate3d(0, 0, 0)", visibility: "hidden" }}
    >
      <div
        aria-label="Drag floating video"
        className="flex h-9 touch-none cursor-grab items-center justify-between bg-black/94 px-3 text-[.62rem] font-semibold uppercase tracking-[.15em] text-white/72 active:cursor-grabbing"
        onPointerCancel={(event) => {
          dragRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerDown={(event) => {
          dragRef.current = {
            pointerId: event.pointerId,
            pointerX: event.clientX,
            pointerY: event.clientY,
            originX: positionRef.current.x,
            originY: positionRef.current.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          event.preventDefault();
          applyPosition({
            x: drag.originX + event.clientX - drag.pointerX,
            y: drag.originY + event.clientY - drag.pointerY,
          });
        }}
        onKeyDown={(event) => {
          const distance = event.shiftKey ? 32 : 12;
          const moves: Partial<Record<string, Point>> = {
            ArrowLeft: { x: -distance, y: 0 },
            ArrowRight: { x: distance, y: 0 },
            ArrowUp: { x: 0, y: -distance },
            ArrowDown: { x: 0, y: distance },
          };
          const move = moves[event.key];
          if (move) {
            event.preventDefault();
            applyPosition({
              x: positionRef.current.x + move.x,
              y: positionRef.current.y + move.y,
            });
          } else if (event.key === "Home") {
            event.preventDefault();
            placeAtInitialPosition();
          }
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        role="button"
        tabIndex={0}
      >
        <span>Drag</span>
        <span aria-hidden="true" className="text-base leading-none">
          ⋮⋮
        </span>
      </div>

      <div className="relative aspect-[9/16] bg-black">
        <video
          className="h-full w-full object-cover"
          loop
          muted={muted}
          onClick={() => void togglePlay()}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
          }}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          playsInline
          poster={poster ?? undefined}
          preload="metadata"
          ref={videoRef}
          src={src}
        />
        {autoplayBlocked && (
          <button
            className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-bold text-white"
            data-no-drag
            onClick={() => void togglePlay()}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <DynamicText kind="action">Play video</DynamicText>
          </button>
        )}
      </div>

      <div
        className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 bg-black/96 p-2 text-white"
        data-no-drag
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          aria-label={playing ? "Pause video" : "Play video"}
          className="min-h-11 min-w-11 px-1 text-[.7rem] font-semibold"
          onClick={() => void togglePlay()}
          type="button"
        >
          <DynamicText kind="action">{playing ? "Pause" : "Play"}</DynamicText>
        </button>
        <button
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="min-h-11 rounded-full bg-gold px-3 text-[.7rem] font-extrabold text-black transition-colors hover:bg-gold-bright"
          onClick={() => void toggleMute()}
          type="button"
        >
          <DynamicText kind="action">{muted ? "Unmute" : "Mute"}</DynamicText>
        </button>
        <button
          aria-label="Close floating video"
          className="grid min-h-11 min-w-11 place-items-center text-xl transition-colors hover:text-gold"
          onClick={() => {
            videoRef.current?.pause();
            setClosed(true);
          }}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
        <input
          aria-label="Video progress"
          className="col-span-3 h-5 w-full cursor-pointer accent-[var(--td-color-gold)]"
          data-no-drag
          max={100}
          min={0}
          onInput={(event) => {
            const video = videoRef.current;
            if (video?.duration)
              video.currentTime = (Number(event.currentTarget.value) / 100) * video.duration;
          }}
          step="0.1"
          type="range"
          value={progress}
        />
      </div>
    </div>
  );
}
