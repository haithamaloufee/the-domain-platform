import { MediaType, type AdminMediaListItem } from "@the-domain/types";
import { MediaFrame } from "@the-domain/ui";
import Image from "next/image";

export function MediaPreview({
  item,
  priority = false,
}: {
  item: AdminMediaListItem;
  priority?: boolean;
}) {
  const source = item.thumbnailUrl ?? (item.mediaType === MediaType.Image ? item.url : null);
  return (
    <MediaFrame className="aspect-[4/5]">
      {source ? (
        <Image
          alt=""
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
          src={source}
        />
      ) : (
        <div className="grid h-full place-items-center bg-surface text-center">
          <span className="font-label text-xs uppercase tracking-[0.14em] text-ink-muted">
            Video preview on details
          </span>
        </div>
      )}
    </MediaFrame>
  );
}
