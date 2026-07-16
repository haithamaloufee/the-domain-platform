"use client";
import {
  GalleryLayoutPreset,
  MediaType,
  type GalleryPublicCollection,
  type GalleryPublicMedia,
} from "@the-domain/types";
import { Dialog } from "@the-domain/ui";
import { galleryLayoutPresets, galleryMediaImageSource } from "@the-domain/utils";
import Image from "next/image";

export function CollectionMediaGrid({ collection }: { collection: GalleryPublicCollection }) {
  const featured =
    collection.media.find((item) => item.id === collection.featuredMediaId) ?? collection.media[0];
  const featureFirst = collection.layoutPreset === GalleryLayoutPreset.FeatureFirst;
  const media = featureFirst
    ? collection.media.filter((item) => item.id !== featured?.id)
    : collection.media;
  return (
    <div className={`gap-3 lg:gap-5 ${galleryLayoutPresets[collection.layoutPreset].gridClass}`}>
      {featureFirst && featured && (
        <MediaTile className="col-span-2 mb-3 aspect-video lg:mb-5" media={featured} priority />
      )}
      {media.map((item, index) => (
        <MediaTile
          className={
            collection.layoutPreset === GalleryLayoutPreset.Editorial
              ? "mb-3 break-inside-avoid lg:mb-5"
              : "aspect-[4/5]"
          }
          key={item.id}
          media={item}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

function MediaTile({
  media,
  priority,
  className,
}: {
  media: GalleryPublicMedia;
  priority: boolean;
  className: string;
}) {
  const source = galleryMediaImageSource(media);
  return (
    <Dialog
      description={media.caption ?? media.altText ?? undefined}
      title={
        media.caption ?? (media.mediaType === MediaType.Video ? "Gallery video" : "Gallery image")
      }
      trigger={
        <button
          aria-label={`Open ${media.mediaType === MediaType.Video ? "video" : "image"}${media.caption ? `: ${media.caption}` : ""}`}
          className={`group relative block w-full overflow-hidden border border-transparent bg-surface-raised text-left transition hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`}
          type="button"
        >
          {source ? (
            <Image
              alt={media.altText ?? ""}
              className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, 25vw"
              src={source}
            />
          ) : (
            <span className="grid min-h-48 place-items-center p-5 text-center text-xs text-ink-muted">
              Video poster unavailable
            </span>
          )}
          {media.mediaType === MediaType.Video && (
            <span className="absolute left-3 top-3 bg-canvas/80 px-2 py-1 text-xs uppercase text-ink">
              Video
            </span>
          )}
        </button>
      }
      variant="media"
    >
      <div>
        {media.mediaType === MediaType.Video ? (
          <video
            className="max-h-[68svh] w-full bg-canvas object-contain"
            controls
            playsInline
            poster={media.posterUrl ?? undefined}
            preload="metadata"
            src={media.url}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="relative h-[min(68svh,52rem)] bg-canvas">
            <Image
              alt={media.altText ?? ""}
              className="object-contain"
              fill
              sizes="100vw"
              src={media.url}
            />
          </div>
        )}
        {media.caption && <p className="mt-4 text-sm leading-6 text-ink-muted">{media.caption}</p>}
      </div>
    </Dialog>
  );
}
