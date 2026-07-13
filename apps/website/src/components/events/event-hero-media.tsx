import { MediaType, type PublicMediaItem } from "@the-domain/types";
import Image from "next/image";
import { mediaImageSource } from "./event-presentation";

export function EventHeroMedia({ media, title }: { media: PublicMediaItem | null; title: string }) {
  const source = mediaImageSource(media);
  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-raised">
      {media?.mediaType === MediaType.Video ? (
        <video
          aria-label={`${title} event video`}
          className="h-full w-full object-cover"
          controls
          playsInline
          poster={media.thumbnailUrl ?? undefined}
          preload="metadata"
          src={media.url}
        />
      ) : source ? (
        <Image
          alt={media?.altText ?? ""}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={source}
        />
      ) : (
        <div className="grid h-full place-items-center">
          <span className="font-label text-xs uppercase tracking-[0.16em] text-ink-muted">
            Event artwork coming soon
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/45 to-canvas/15" />
    </div>
  );
}
