import type { PublicGalleryAlbum } from "@the-domain/types";
import { MediaFrame, buttonClasses } from "@the-domain/ui";
import Image from "next/image";
import Link from "next/link";
import { formatEventDate, mediaImageSource } from "@/components/events/event-presentation";

export function AlbumCard({
  album,
  priority = false,
}: {
  album: PublicGalleryAlbum;
  priority?: boolean;
}) {
  const cover = album.coverMedia;
  const source = mediaImageSource(cover);

  return (
    <article className="group relative min-h-[32rem] overflow-hidden border border-line bg-surface">
      <MediaFrame className="absolute inset-0">
        {source ? (
          <Image
            alt={cover?.altText ?? ""}
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={source}
          />
        ) : (
          <div className="grid h-full place-items-center bg-surface-raised px-8 text-center">
            <span className="font-label text-xs uppercase tracking-[0.16em] text-ink-muted">
              Album artwork unavailable
            </span>
          </div>
        )}
      </MediaFrame>
      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
      <div className="relative flex min-h-[32rem] flex-col justify-end p-6 sm:p-9">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
          {formatEventDate(album.eventStartAtUtc, album.timeZoneId)}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          {album.title}
        </h2>
        <p className="mt-3 text-sm text-ink-muted">
          {album.city} / {album.venueName}
        </p>
        <p className="mt-2 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
          {album.photoCount} photos / {album.videoCount} videos
        </p>
        <div className="mt-6">
          <Link className={buttonClasses("primary")} href={`/gallery/${album.eventSlug}`}>
            View Album
          </Link>
        </div>
      </div>
    </article>
  );
}
