"use client";

import { MediaType, type PublicMediaItem } from "@the-domain/types";
import { EmptyState, buttonClasses } from "@the-domain/ui";
import { useMemo, useState } from "react";
import { MediaViewer, type MediaViewerItem } from "./media-viewer";
import { PublicMediaThumbnail } from "./public-media-thumbnail";

type MediaFilter = "all" | "photos" | "videos";
const mediaBatchSize = 24;

const filters: Array<{ label: string; value: MediaFilter }> = [
  { label: "All", value: "all" },
  { label: "Photos", value: "photos" },
  { label: "Videos", value: "videos" },
];

export function GalleryMediaGrid({
  media,
  showFilters = true,
}: {
  media: PublicMediaItem[];
  showFilters?: boolean;
}) {
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [visibleCount, setVisibleCount] = useState(mediaBatchSize);
  const orderedMedia = useMemo(
    () => [...media].sort((left, right) => left.sortOrder - right.sortOrder),
    [media],
  );
  const visible = orderedMedia.filter((item) => {
    if (filter === "photos") return item.mediaType === MediaType.Image;
    if (filter === "videos") return item.mediaType === MediaType.Video;
    return true;
  });
  const rendered = visible.slice(0, visibleCount);
  const viewerItems = visible.map(toViewerItem);
  const hasBothMediaTypes =
    orderedMedia.some((item) => item.mediaType === MediaType.Image) &&
    orderedMedia.some((item) => item.mediaType === MediaType.Video);

  return (
    <div>
      {showFilters && hasBothMediaTypes && (
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
      )}

      {visible.length === 0 ? (
        <div className={showFilters ? "mt-10" : undefined}>
          <EmptyState
            description="Choose another filter to continue exploring this event."
            title={`No ${filter === "all" ? "media" : filter} in this album`}
          />
        </div>
      ) : (
        <MediaViewer items={viewerItems}>
          {({ openAt }) => (
            <div
              className={
                showFilters && hasBothMediaTypes
                  ? "mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-5"
                  : "columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-5"
              }
            >
              {rendered.map((item, index) => (
                <div
                  className="group mb-3 break-inside-avoid lg:mb-5"
                  key={`${item.id}-${item.usage}-${index}`}
                >
                  <button
                    aria-label={`Open ${item.mediaType === MediaType.Video ? "video" : "photo"}${item.caption ? `: ${item.caption}` : ""}`}
                    className="relative block w-full border border-transparent text-left transition hover:border-gold focus-visible:border-gold focus-visible:outline-2 focus-visible:outline-offset-4"
                    onClick={(event) => openAt(index, event.currentTarget)}
                    type="button"
                  >
                    <PublicMediaThumbnail media={item} />
                    <span className="absolute right-3 top-3 border border-ink/30 bg-canvas/70 px-2 py-1 font-label text-[0.5625rem] uppercase tracking-[0.12em] text-ink opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      Open
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </MediaViewer>
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

function toViewerItem(media: PublicMediaItem): MediaViewerItem {
  return {
    id: `${media.id}-${media.usage}`,
    mediaType: media.mediaType,
    sourceUrl: media.url,
    posterUrl: media.videoPoster.posterUrl ?? media.thumbnailUrl,
    altText: media.altText ?? "",
    caption: media.caption,
  };
}
