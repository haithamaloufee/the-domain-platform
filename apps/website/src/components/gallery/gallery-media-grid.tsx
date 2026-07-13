"use client";

import { MediaType, type PublicMediaItem } from "@the-domain/types";
import { Dialog, EmptyState, buttonClasses } from "@the-domain/ui";
import Image from "next/image";
import { useState } from "react";
import { PublicMediaThumbnail } from "./public-media-thumbnail";

type MediaFilter = "all" | "photos" | "videos";
const mediaBatchSize = 24;

const filters: Array<{ label: string; value: MediaFilter }> = [
  { label: "All", value: "all" },
  { label: "Photos", value: "photos" },
  { label: "Videos", value: "videos" },
];

export function GalleryMediaGrid({ media }: { media: PublicMediaItem[] }) {
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [visibleCount, setVisibleCount] = useState(mediaBatchSize);
  const visible = media.filter((item) => {
    if (filter === "photos") return item.mediaType === MediaType.Image;
    if (filter === "videos") return item.mediaType === MediaType.Video;
    return true;
  });
  const rendered = visible.slice(0, visibleCount);

  return (
    <div>
      <div aria-label="Filter gallery media" className="flex flex-wrap gap-2" role="group">
        {filters.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={buttonClasses(filter === item.value ? "primary" : "secondary", "min-w-24")}
            key={item.value}
            onClick={() => {
              setFilter(item.value);
              setVisibleCount(mediaBatchSize);
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            description="Choose another filter to continue exploring this event."
            title={`No ${filter === "all" ? "media" : filter} in this album`}
          />
        </div>
      ) : (
        <div className="mt-10 columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-5">
          {rendered.map((item, index) => (
            <div className="group mb-3 break-inside-avoid lg:mb-5" key={item.id}>
              <Dialog
                description={item.caption ?? item.altText ?? undefined}
                title={
                  item.caption ||
                  (item.mediaType === MediaType.Video ? "Event video" : "Event photo")
                }
                trigger={
                  <button
                    aria-label={`Open ${item.mediaType === MediaType.Video ? "video" : "photo"}${item.caption ? `: ${item.caption}` : ""}`}
                    className="block w-full border border-transparent text-left transition hover:border-gold focus-visible:border-gold focus-visible:outline-2 focus-visible:outline-offset-4"
                    type="button"
                  >
                    <PublicMediaThumbnail media={item} priority={index < 4} />
                  </button>
                }
                variant="media"
              >
                <MediaDialogContent media={item} />
              </Dialog>
            </div>
          ))}
        </div>
      )}
      {visibleCount < visible.length && (
        <div className="mt-10 flex justify-center">
          <button
            className={buttonClasses("secondary")}
            onClick={() => setVisibleCount((count) => count + mediaBatchSize)}
            type="button"
          >
            Load more highlights
          </button>
        </div>
      )}
    </div>
  );
}

function MediaDialogContent({ media }: { media: PublicMediaItem }) {
  return (
    <div>
      <div className="relative h-[min(68svh,52rem)] overflow-hidden bg-canvas">
        {media.mediaType === MediaType.Video ? (
          <video
            className="h-full w-full object-contain"
            controls
            playsInline
            poster={media.thumbnailUrl ?? undefined}
            preload="metadata"
            src={media.url}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <Image
            alt={media.altText ?? ""}
            className="object-contain"
            fill
            sizes="(max-width: 640px) 100vw, 64rem"
            src={media.url}
          />
        )}
      </div>
      {media.caption && <p className="mt-4 text-sm leading-6 text-ink-muted">{media.caption}</p>}
    </div>
  );
}
