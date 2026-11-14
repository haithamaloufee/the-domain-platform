import { MediaApprovalStatus, MediaType, type GalleryAdminCollection } from "@the-domain/types";
import { safeGalleryLayoutPreset } from "@the-domain/utils";
export function parseGalleryAdminCollections(value: unknown): GalleryAdminCollection[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid Gallery collections.");
  return value.map(parseGalleryAdminCollection);
}
export function parseGalleryAdminCollection(value: unknown): GalleryAdminCollection {
  if (!record(value) || !Array.isArray(value.media))
    throw new Error("The server returned an invalid Gallery collection.");
  return {
    id: text(value.id),
    name: text(value.name),
    isArchived: bool(value.isArchived),
    isPublished: bool(value.isPublished),
    gallerySortOrder: integer(value.gallerySortOrder),
    publicTitle: nullableText(value.publicTitle),
    publicDescription: nullableText(value.publicDescription),
    layoutPreset: safeGalleryLayoutPreset(value.layoutPreset),
    featuredMediaAssetId: nullableText(value.featuredMediaAssetId),
    totalMediaCount: integer(value.totalMediaCount),
    eligibleMediaCount: integer(value.eligibleMediaCount),
    media: value.media.map((item) => {
      if (!record(item)) throw new Error("Invalid Gallery media.");
      return {
        id: text(item.id),
        originalFileName: text(item.originalFileName),
        mediaType: enumeration(item.mediaType, MediaType),
        url: url(item.url),
        posterUrl: nullableUrl(item.posterUrl),
        caption: nullableText(item.caption),
        altText: nullableText(item.altText),
        approvalStatus: enumeration(item.approvalStatus, MediaApprovalStatus),
        isArchived: bool(item.isArchived),
        sortOrder: integer(item.sortOrder),
        isPubliclyEligible: bool(item.isPubliclyEligible),
        exclusionReason: nullableText(item.exclusionReason),
      };
    }),
  };
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function text(value: unknown) {
  if (typeof value !== "string" || !value) throw new Error("Expected text.");
  return value;
}
function nullableText(value: unknown) {
  return value === null ? null : text(value);
}
function bool(value: unknown) {
  if (typeof value !== "boolean") throw new Error("Expected boolean.");
  return value;
}
function integer(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) throw new Error("Expected integer.");
  return value;
}
function url(value: unknown) {
  const result = text(value);
  if (new URL(result).protocol !== "https:") throw new Error("Expected HTTPS URL.");
  return result;
}
function nullableUrl(value: unknown) {
  return value === null ? null : url(value);
}
function enumeration<T extends Record<string, number>>(value: unknown, values: T): T[keyof T] {
  if (!Object.values(values).includes(value as number)) throw new Error("Invalid enum.");
  return value as T[keyof T];
}
