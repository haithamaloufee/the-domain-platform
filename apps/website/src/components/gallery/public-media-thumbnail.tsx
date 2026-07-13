import { MediaOrientation, MediaType, type PublicMediaItem } from "@the-domain/types";
import { Badge, MediaFrame } from "@the-domain/ui";
import Image from "next/image";
import { mediaImageSource } from "@/components/events/event-presentation";

export function PublicMediaThumbnail({
  media,
  priority = false,
}: {
  media: PublicMediaItem;
  priority?: boolean;
}) {
  const source = mediaImageSource(media);
  const aspectClass =
    media.orientation === MediaOrientation.Landscape
      ? "aspect-[4/3]"
      : media.orientation === MediaOrientation.Square
        ? "aspect-square"
        : "aspect-[4/5]";
  return (
    <MediaFrame className={aspectClass}>
      {source ? (
        <Image
          alt={media.altText ?? ""}
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          src={source}
        />
      ) : (
        <div className="grid h-full place-items-center bg-surface-raised px-4 text-center">
          <span className="font-label text-xs uppercase tracking-[0.14em] text-ink-muted">
            Video available on open
          </span>
        </div>
      )}
      {media.mediaType === MediaType.Video && (
        <Badge className="absolute left-3 top-3 border-ink/50 bg-canvas/70 text-ink">Video</Badge>
      )}
      {media.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas/95 to-transparent px-4 pb-4 pt-12">
          <p className="line-clamp-2 text-sm text-ink">{media.caption}</p>
        </div>
      )}
    </MediaFrame>
  );
}
