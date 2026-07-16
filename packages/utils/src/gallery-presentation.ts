import {
  GalleryLayoutPreset,
  MediaType,
  type GalleryAdminCollection,
  type GalleryPublicMedia,
  type GalleryLayoutPresetValue,
} from "@the-domain/types";
export const galleryLayoutPresets: Record<
  GalleryLayoutPresetValue,
  { label: string; description: string; gridClass: string }
> = {
  [GalleryLayoutPreset.Editorial]: {
    label: "Editorial rhythm",
    description: "Varied cinematic tiles with generous spacing.",
    gridClass: "columns-2 sm:columns-3 lg:columns-4",
  },
  [GalleryLayoutPreset.Balanced]: {
    label: "Balanced grid",
    description: "Consistent gallery tiles with a calm visual rhythm.",
    gridClass: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  },
  [GalleryLayoutPreset.FeatureFirst]: {
    label: "Feature first",
    description: "A prominent lead item followed by supporting highlights.",
    gridClass: "grid grid-cols-2 sm:grid-cols-3",
  },
  [GalleryLayoutPreset.Compact]: {
    label: "Compact highlights",
    description: "A denser layout for larger collections.",
    gridClass: "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
  },
};
export const galleryLayoutPresetValues = Object.values(
  GalleryLayoutPreset,
) as GalleryLayoutPresetValue[];
export function safeGalleryLayoutPreset(value: unknown): GalleryLayoutPresetValue {
  return galleryLayoutPresetValues.includes(value as GalleryLayoutPresetValue)
    ? (value as GalleryLayoutPresetValue)
    : GalleryLayoutPreset.Editorial;
}
export function galleryUnsaved(
  left: Pick<
    GalleryAdminCollection,
    "publicTitle" | "publicDescription" | "layoutPreset" | "featuredMediaAssetId"
  >,
  right: typeof left,
) {
  return (
    left.publicTitle !== right.publicTitle ||
    left.publicDescription !== right.publicDescription ||
    left.layoutPreset !== right.layoutPreset ||
    left.featuredMediaAssetId !== right.featuredMediaAssetId
  );
}
export function galleryMediaImageSource(
  media: Pick<GalleryPublicMedia, "mediaType" | "url" | "posterUrl">,
): string | null {
  return media.mediaType === MediaType.Image ? safeHttps(media.url) : safeHttps(media.posterUrl);
}
function safeHttps(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
export function moveGalleryId(ids: readonly string[], activeId: string, overId: string): string[] {
  const next = [...ids];
  const from = next.indexOf(activeId);
  const to = next.indexOf(overId);
  if (from < 0 || to < 0 || from === to) return next;
  const [moved] = next.splice(from, 1);
  if (moved) next.splice(to, 0, moved);
  return next;
}
export function galleryFeaturedMedia<T extends { id: string }>(
  media: readonly T[],
  featuredId: string | null,
): T | undefined {
  return media.find((item) => item.id === featuredId) ?? media[0];
}
export const galleryPreviewWidths = {
  desktop: "max-w-full",
  tablet: "max-w-2xl",
  mobile: "max-w-xs",
} as const;
