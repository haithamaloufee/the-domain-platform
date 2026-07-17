"use client";

import { MediaType, type MediaTypeValue } from "@the-domain/types";
import { Dialog, buttonClasses } from "@the-domain/ui";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface MediaViewerItem {
  id: string;
  mediaType: MediaTypeValue;
  sourceUrl: string;
  posterUrl: string | null;
  altText: string;
  caption: string | null;
}

interface MediaViewerControls {
  openAt: (index: number, trigger: HTMLElement) => void;
}

export function MediaViewer({
  children,
  items,
}: {
  children: (controls: MediaViewerControls) => ReactNode;
  items: MediaViewerItem[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [returnFocusTarget, setReturnFocusTarget] = useState<HTMLElement | null>(null);
  const activeItem = activeIndex === null ? null : (items[activeIndex] ?? null);

  const openAt = useCallback((index: number, trigger: HTMLElement) => {
    setReturnFocusTarget(trigger);
    setActiveIndex(index);
  }, []);

  const close = useCallback(() => {
    setActiveIndex(null);
    setReturnFocusTarget(null);
    window.requestAnimationFrame(() => returnFocusTarget?.focus());
  }, [returnFocusTarget]);

  const move = useCallback(
    (direction: -1 | 1) => {
      setActiveIndex((current) => {
        if (current === null || items.length < 2) return current;
        return (current + direction + items.length) % items.length;
      });
    },
    [items.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLVideoElement) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, move]);

  return (
    <>
      {children({ openAt })}
      <Dialog
        closeLabel="Close viewer"
        description="Use the previous and next controls or the left and right arrow keys to browse media."
        onOpenChange={(open) => {
          if (!open) close();
        }}
        open={activeItem !== null}
        title="Media viewer"
        titleVisuallyHidden
        variant="media"
      >
        {activeItem && activeIndex !== null && (
          <div className="flex h-[min(86svh,58rem)] min-h-0 flex-col">
            <div className="flex min-h-14 flex-none items-center gap-2 border-b border-line px-3 pr-24 sm:px-5 sm:pr-28">
              <p
                aria-label={`Media item position ${activeIndex + 1} of ${items.length}`}
                aria-live="polite"
                className="mr-auto font-label text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted"
              >
                {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              {items.length > 1 && (
                <>
                  <button
                    aria-label="Previous media"
                    className={buttonClasses("ghost", "min-h-10 border-line px-3 text-ink")}
                    onClick={() => move(-1)}
                    type="button"
                  >
                    Previous
                  </button>
                  <button
                    aria-label="Next media"
                    className={buttonClasses("ghost", "min-h-10 border-line px-3 text-ink")}
                    onClick={() => move(1)}
                    type="button"
                  >
                    Next
                  </button>
                </>
              )}
            </div>

            <ViewerMedia item={activeItem} key={activeItem.id} onImageClick={close} />

            <div className="flex min-h-14 flex-none items-center border-t border-line px-4 py-3 sm:px-5">
              <p className="line-clamp-2 max-w-4xl text-sm leading-6 text-ink-muted">
                {activeItem.caption ?? activeItem.altText}
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

function ViewerMedia({ item, onImageClick }: { item: MediaViewerItem; onImageClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
      {item.mediaType === MediaType.Video ? (
        <video
          aria-label={item.altText || item.caption || "Gallery video"}
          className="h-full w-full object-contain"
          controls
          playsInline
          poster={item.posterUrl ?? undefined}
          preload="metadata"
          ref={videoRef}
          src={item.sourceUrl}
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <button
          aria-label="Close enlarged image"
          className="relative h-full w-full cursor-zoom-out"
          onClick={onImageClick}
          type="button"
        >
          <Image
            alt={item.altText}
            className="object-contain"
            fill
            sizes="100vw"
            src={item.sourceUrl}
          />
        </button>
      )}
    </div>
  );
}
