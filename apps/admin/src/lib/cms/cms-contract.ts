import type {
  AdminHomepageContent,
  AdminPartner,
  AdminStatisticItem,
  CreatePartnerRequest,
  CreateStatisticRequest,
  UpdateHomepageContentRequest,
} from "@the-domain/types";
import { MediaType } from "@the-domain/types";

type CmsRequest = UpdateHomepageContentRequest | CreateStatisticRequest | CreatePartnerRequest;
export type CmsRequestShape = "homepage" | "statistic" | "partner";

export function parseAdminHomepage(value: unknown): AdminHomepageContent | null {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("The server returned invalid homepage content.");
  return {
    id: requiredString(value.id),
    ...parseHomepageFields(value),
    isPublished: booleanValue(value.isPublished),
    createdAtUtc: dateString(value.createdAtUtc),
    updatedAtUtc: dateString(value.updatedAtUtc),
    builder: parseBuilder(value.builder),
  };
}

export function parseAdminStatistics(value: unknown): AdminStatisticItem[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid statistics.");
  return value.map(parseAdminStatistic);
}

export function parseAdminStatistic(value: unknown): AdminStatisticItem {
  if (!isRecord(value)) throw new Error("The server returned an invalid statistic.");
  return {
    id: requiredString(value.id),
    slotNumber: positiveInteger(value.slotNumber),
    ...parseStatisticFields(value),
    createdAtUtc: dateString(value.createdAtUtc),
    updatedAtUtc: dateString(value.updatedAtUtc),
  };
}

export function parseAdminPartners(value: unknown): AdminPartner[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid partners.");
  return value.map(parseAdminPartner);
}

export function parseAdminPartner(value: unknown): AdminPartner {
  if (!isRecord(value)) throw new Error("The server returned an invalid partner.");
  return {
    id: requiredString(value.id),
    ...parsePartnerFields(value),
    createdAtUtc: dateString(value.createdAtUtc),
    updatedAtUtc: dateString(value.updatedAtUtc),
  };
}

export function parseCmsRequest(value: unknown, shape: CmsRequestShape): CmsRequest | null {
  if (!isRecord(value)) return null;
  try {
    if (shape === "homepage") {
      return { ...parseHomepageFields(value), isPublished: booleanValue(value.isPublished) };
    }
    return shape === "statistic" ? parseStatisticFields(value) : parsePartnerFields(value);
  } catch {
    return null;
  }
}

function parseHomepageFields(value: Record<string, unknown>): UpdateHomepageContentRequest {
  const builder = isRecord(value.builder) ? parseBuilder(value.builder) : null;
  return {
    isPublished: booleanValue(value.isPublished),
    heroMediaAssetId: nullableBoundedString(
      value.heroMediaAssetId ?? builder?.heroMediaAssetId ?? null,
      64,
    ),
    galleryCollectionId: nullableBoundedString(
      value.galleryCollectionId ?? builder?.galleryCollectionId ?? null,
      64,
    ),
    isFloatingVideoEnabled: booleanValue(
      value.isFloatingVideoEnabled ?? builder?.isFloatingVideoEnabled ?? false,
    ),
    floatingVideoMediaAssetId: nullableBoundedString(
      value.floatingVideoMediaAssetId ?? builder?.floatingVideoMediaAssetId ?? null,
      64,
    ),
    floatingVideoPosterMediaAssetId: nullableBoundedString(
      value.floatingVideoPosterMediaAssetId ?? builder?.floatingVideoPosterMediaAssetId ?? null,
      64,
    ),
  };
}
function parseBuilder(value: unknown) {
  if (!isRecord(value)) throw new Error("Invalid homepage builder settings.");
  return {
    heroMediaAssetId: nullableBoundedString(value.heroMediaAssetId, 64),
    galleryCollectionId: nullableBoundedString(value.galleryCollectionId, 64),
    heroMedia: value.heroMedia === null ? null : parseHeroMedia(value.heroMedia),
    isFloatingVideoEnabled: booleanValue(value.isFloatingVideoEnabled),
    floatingVideoMediaAssetId: nullableBoundedString(value.floatingVideoMediaAssetId, 64),
    floatingVideoPosterMediaAssetId: nullableBoundedString(
      value.floatingVideoPosterMediaAssetId,
      64,
    ),
    floatingVideoMedia:
      value.floatingVideoMedia === null ? null : parseHeroMedia(value.floatingVideoMedia),
    floatingVideoPoster:
      value.floatingVideoPoster === null ? null : parseHeroMedia(value.floatingVideoPoster),
  };
}
function parseHeroMedia(value: unknown) {
  if (!isRecord(value)) throw new Error("Invalid hero media.");
  return {
    id: requiredString(value.id),
    mediaType: nonNegativeInteger(value.mediaType) as MediaType,
    url: boundedString(value.url, 2048),
    posterUrl: nullableBoundedString(value.posterUrl, 2048),
    altText: nullableBoundedString(value.altText, 500),
  };
}
function parseStatisticFields(value: Record<string, unknown>): CreateStatisticRequest {
  return {
    label: boundedString(value.label, 100),
    value: boundedString(value.value, 50),
    suffix: nullableBoundedString(value.suffix, 20),
    description: nullableBoundedString(value.description, 500),
    sortOrder: nonNegativeInteger(value.sortOrder),
    isVisible: booleanValue(value.isVisible),
    isVerified: booleanValue(value.isVerified),
  };
}

function parsePartnerFields(value: Record<string, unknown>): CreatePartnerRequest {
  return {
    name: boundedString(value.name, 150),
    slug: boundedString(value.slug, 160),
    logoUrl: nullableBoundedString(value.logoUrl, 2_048),
    websiteUrl: nullableBoundedString(value.websiteUrl, 2_048),
    description: nullableBoundedString(value.description, 500),
    sortOrder: nonNegativeInteger(value.sortOrder),
    isVisible: booleanValue(value.isVisible),
    isFeatured: booleanValue(value.isFeatured),
    logoMediaAssetId: nullableBoundedString(value.logoMediaAssetId, 64),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new Error("Expected a string.");
  return value;
}

function boundedString(value: unknown, maximum: number): string {
  if (typeof value !== "string" || value.length > maximum) throw new Error("Invalid text.");
  return value;
}

function nullableBoundedString(value: unknown, maximum: number): string | null {
  if (value === null || value === "") return null;
  return boundedString(value, maximum);
}

function booleanValue(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Expected a boolean.");
  return value;
}

function nonNegativeInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
    throw new Error("Expected a non-negative integer.");
  return value;
}

function positiveInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1)
    throw new Error("Expected a positive integer.");
  return value;
}

function dateString(value: unknown): string {
  const result = requiredString(value);
  if (Number.isNaN(new Date(result).getTime())) throw new Error("Expected a date.");
  return result;
}
