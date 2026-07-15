import type { PublicMediaItem } from "@the-domain/types";
import { eventCoverRenderData } from "@the-domain/utils";
import Image from "next/image";

export function EventCoverImage({
  className = "cinematic-media object-cover",
  media,
  priority = false,
  sizes,
}: {
  className?: string;
  media: PublicMediaItem;
  priority?: boolean;
  sizes: string;
}) {
  const rendering = eventCoverRenderData(media);
  if (!rendering) return null;
  return (
    <Image
      alt={rendering.altText}
      className={className}
      fill
      priority={priority}
      sizes={sizes}
      src={rendering.sourceUrl}
      style={rendering.style}
    />
  );
}
