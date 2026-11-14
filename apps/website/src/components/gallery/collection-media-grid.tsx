"use client";

import {
  GalleryLayoutPreset,
  MediaOrientation,
  MediaType,
  type GalleryPublicCollection,
  type GalleryPublicMedia,
} from "@the-domain/types";
import { Badge } from "@the-domain/ui";
import { cn, galleryMediaImageSource } from "@the-domain/utils";
import Image from "next/image";
import { MediaViewer, type MediaViewerItem } from "./media-viewer";

export function CollectionMediaGrid({ collection }: { collection: GalleryPublicCollection }) {
  const ordered = [...collection.media].sort((left, right) => left.sortOrder - right.sortOrder);
  const featured = ordered.find((item) => item.id === collection.featuredMediaId) ?? ordered[0];
  const featureFirst = collection.layoutPreset === GalleryLayoutPreset.FeatureFirst;
  const arranged = featureFirst
    ? [featured, ...ordered.filter((item) => item.id !== featured?.id)].filter(
        (item): item is GalleryPublicMedia => Boolean(item),
      )
    : ordered;
  const viewerItems = arranged.map(toViewerItem);

  return (
    <MediaViewer items={viewerItems}>
      {({ openAt }) => (
        <div className={layoutClass(collection.layoutPreset)}>
          {arranged.map((item, index) => (
            <MediaTile
              className={tileClass(collection.layoutPreset, item, index)}
              index={index}
              key={`${item.id}-${index}`}
              media={item}
              onOpen={openAt}
            />
          ))}
        </div>
      )}
    </MediaViewer>
  );
}

function MediaTile({
  className,
  index,
  media,
  onOpen,
}: {
  className: string;
  index: number;
  media: GalleryPublicMedia;
  onOpen: (index: number, trigger: HTMLElement) => void;
}) {
  const source = galleryMediaImageSource(media);
  return (
    <button
      aria-label={`Open ${media.mediaType === MediaType.Video ? "video" : "image"}${media.caption ? `: ${media.caption}` : ""}`}
      className={cn(
        "group relative block w-full overflow-hidden border border-transparent bg-surface-raised text-left transition hover:border-gold focus-visible:border-gold focus-visible:outline-2 focus-visible:outline-offset-4",
        className,
      )}
      onClick={(event) => onOpen(index, event.currentTarget)}
      type="button"
    >
      {source ? (
        <Image
          alt={media.altText ?? ""}
          className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={source}
        />
      ) : (
        <span className="architectural-grid grid h-full min-h-64 place-items-center p-5 text-center text-xs text-ink-muted">
          Video poster unavailable
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
      {media.mediaType === MediaType.Video && (
        <Badge className="absolute left-3 top-3 border-ink/40 bg-canvas/75 text-ink backdrop-blur-sm">
          Video
        </Badge>
      )}
      <span className="absolute right-3 top-3 border border-ink/30 bg-canvas/70 px-2 py-1 font-label text-[0.5625rem] uppercase tracking-[0.12em] text-ink opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Open
      </span>
      {media.caption && (
        <span className="absolute inset-x-0 bottom-0 line-clamp-2 px-4 pb-4 pt-12 text-sm leading-6 text-ink">
          {media.caption}
        </span>
      )}
    </button>
  );
}

function layoutClass(preset: GalleryPublicCollection["layoutPreset"]): string {
  switch (preset) {
    case GalleryLayoutPreset.Editorial:
      return "columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-5";
    case GalleryLayoutPreset.Balanced:
      return "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5";
    case GalleryLayoutPreset.FeatureFirst:
      return "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5";
    case GalleryLayoutPreset.Compact:
      return "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4";
  }
}

function tileClass(
  preset: GalleryPublicCollection["layoutPreset"],
  media: GalleryPublicMedia,
  index: number,
): string {
  if (preset === GalleryLayoutPreset.FeatureFirst && index === 0) {
    return "aspect-[4/3] sm:col-span-2 sm:aspect-video lg:col-span-3";
  }

  const aspect =
    media.orientation === MediaOrientation.Landscape
      ? "aspect-[16/10]"
      : media.orientation === MediaOrientation.Square
        ? "aspect-square"
        : "aspect-[4/5]";
  return preset === GalleryLayoutPreset.Editorial
    ? `mb-3 break-inside-avoid lg:mb-5 ${aspect}`
    : aspect;
}

function toViewerItem(media: GalleryPublicMedia): MediaViewerItem {
  return {
    id: media.id,
    mediaType: media.mediaType,
    sourceUrl: media.url,
    posterUrl: media.posterUrl,
    altText: media.altText ?? "",
    caption: media.caption,
  };
}
