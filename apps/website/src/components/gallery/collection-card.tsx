import type { GalleryPublicCollection } from "@the-domain/types";
import { MediaFrame, buttonClasses } from "@the-domain/ui";
import { galleryMediaImageSource } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";

export function CollectionCard({
  collection,
  priority,
}: {
  collection: GalleryPublicCollection;
  priority: boolean;
}) {
  const featured =
    collection.media.find((item) => item.id === collection.featuredMediaId) ?? collection.media[0];
  const source = featured ? galleryMediaImageSource(featured) : null;
  return (
    <article className="cinematic-card group relative min-h-[32rem] overflow-hidden border border-line bg-surface">
      <MediaFrame className="absolute inset-0 border-0">
        {source ? (
          <Image
            alt={featured?.altText ?? ""}
            className="cinematic-media object-cover"
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={source}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-muted">
            Collection artwork unavailable
          </div>
        )}
      </MediaFrame>
      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
      <div className="relative flex min-h-[32rem] flex-col justify-end p-6 sm:p-9">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
          Curated collection
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          {collection.title}
        </h2>
        {collection.description && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">{collection.description}</p>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-ink-muted">
          {collection.media.length} highlights
        </p>
        <div className="mt-6">
          <Link className={buttonClasses("primary")} href={`/gallery/${collection.id}`}>
            View collection
          </Link>
        </div>
      </div>
    </article>
  );
}
