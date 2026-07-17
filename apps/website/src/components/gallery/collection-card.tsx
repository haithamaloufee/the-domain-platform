import { MediaType, type GalleryPublicCollection } from "@the-domain/types";
import { Badge, MediaFrame } from "@the-domain/ui";
import { cn, galleryMediaImageSource } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";

export function CollectionCard({
  className,
  collection,
  priority,
  variant = "standard",
}: {
  className?: string;
  collection: GalleryPublicCollection;
  priority: boolean;
  variant?: "standard" | "tall" | "wide";
}) {
  const featured =
    collection.media.find((item) => item.id === collection.featuredMediaId) ?? collection.media[0];
  const source = featured ? galleryMediaImageSource(featured) : null;
  const photos = collection.media.filter((item) => item.mediaType === MediaType.Image).length;
  const videos = collection.media.length - photos;
  const heightClass =
    variant === "tall"
      ? "min-h-[34rem] sm:min-h-[42rem]"
      : variant === "wide"
        ? "min-h-[30rem] sm:min-h-[36rem]"
        : "min-h-[30rem] sm:min-h-[34rem]";

  return (
    <article className={cn("group min-w-0", className)}>
      <Link
        aria-label={`View ${collection.title} collection`}
        className={cn(
          "cinematic-card relative flex flex-col justify-end overflow-hidden border border-line bg-surface p-6 focus-visible:outline-2 focus-visible:outline-offset-4 sm:p-9",
          heightClass,
        )}
        href={`/gallery/${collection.id}`}
      >
        <MediaFrame className="absolute inset-0 border-0">
          {source ? (
            <Image
              alt={featured?.altText || `${collection.title} collection cover`}
              className="cinematic-media object-cover"
              fill
              priority={priority}
              sizes={
                variant === "wide"
                  ? "(max-width: 1024px) 100vw, 75vw"
                  : "(max-width: 1024px) 100vw, 50vw"
              }
              src={source}
            />
          ) : (
            <div className="architectural-grid grid h-full place-items-center px-8 text-center text-sm text-ink-muted">
              Collection artwork unavailable
            </div>
          )}
        </MediaFrame>
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/35 to-canvas/5" />

        <div className="relative max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-gold bg-canvas/70 text-gold backdrop-blur-sm">
              Curated collection
            </Badge>
            {featured?.mediaType === MediaType.Video && (
              <Badge className="bg-canvas/70 text-ink backdrop-blur-sm">Lead video</Badge>
            )}
          </div>
          <h2
            className={cn(
              "mt-5 break-words font-display font-bold tracking-[-0.045em] text-ink",
              variant === "wide" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl",
            )}
          >
            {collection.title}
          </h2>
          {collection.description && (
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">
              {collection.description}
            </p>
          )}
          <p className="mt-4 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
            {collection.media.length} {collection.media.length === 1 ? "highlight" : "highlights"}
            {photos > 0 ? ` / ${photos} ${photos === 1 ? "photo" : "photos"}` : ""}
            {videos > 0 ? ` / ${videos} ${videos === 1 ? "video" : "videos"}` : ""}
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center border border-gold bg-gold px-5 font-label text-xs font-semibold uppercase tracking-[0.12em] text-canvas transition group-hover:bg-gold-bright">
            View collection
          </span>
        </div>
      </Link>
    </article>
  );
}
