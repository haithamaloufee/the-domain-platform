import type {
  AdminHomepageContent,
  AdminPartner,
  AdminStatisticItem,
  CreatePartnerRequest,
  CreateStatisticRequest,
  UpdateHomepageContentRequest,
} from "@the-domain/types";
import { HomepageSectionKey } from "@the-domain/types";

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
    heroEyebrow: boundedString(value.heroEyebrow, 100),
    heroTitle: boundedString(value.heroTitle, 200),
    heroAccent: nullableBoundedString(value.heroAccent, 200),
    heroDescription: boundedString(value.heroDescription, 1_000),
    primaryCtaLabel: boundedString(value.primaryCtaLabel, 100),
    primaryCtaHref: boundedString(value.primaryCtaHref, 2_048),
    secondaryCtaLabel: nullableBoundedString(value.secondaryCtaLabel, 100),
    secondaryCtaHref: nullableBoundedString(value.secondaryCtaHref, 2_048),
    whyTitle: boundedString(value.whyTitle, 200),
    whyDescription: boundedString(value.whyDescription, 2_000),
    servicesTitle: boundedString(value.servicesTitle, 200),
    servicesDescription: boundedString(value.servicesDescription, 1_000),
    partnersTitle: boundedString(value.partnersTitle, 200),
    partnersDescription: boundedString(value.partnersDescription, 1_000),
    contactTitle: boundedString(value.contactTitle, 200),
    contactDescription: boundedString(value.contactDescription, 1_000),
    contactCtaLabel: boundedString(value.contactCtaLabel, 100),
    contactCtaHref: boundedString(value.contactCtaHref, 2_048),
    isPublished: booleanValue(value.isPublished),
    heroMediaAssetId: nullableBoundedString(
      value.heroMediaAssetId ?? builder?.heroMediaAssetId ?? null,
      64,
    ),
    galleryCollectionId: nullableBoundedString(
      value.galleryCollectionId ?? builder?.galleryCollectionId ?? null,
      64,
    ),
    sectionOrder: sectionKeys(value.sectionOrder ?? builder?.sectionOrder),
    disabledSections: sectionKeys(value.disabledSections ?? builder?.disabledSections, true),
    eventsTitle: boundedString(value.eventsTitle ?? builder?.eventsTitle, 160),
    eventsDescription: boundedString(value.eventsDescription ?? builder?.eventsDescription, 500),
    previousEventsTitle: boundedString(
      value.previousEventsTitle ?? builder?.previousEventsTitle,
      160,
    ),
    previousEventsDescription: boundedString(
      value.previousEventsDescription ?? builder?.previousEventsDescription,
      500,
    ),
    galleryTitle: boundedString(value.galleryTitle ?? builder?.galleryTitle, 160),
    galleryDescription: boundedString(value.galleryDescription ?? builder?.galleryDescription, 500),
  };
}
function parseBuilder(value: unknown) {
  if (!isRecord(value)) throw new Error("Invalid homepage builder settings.");
  return {
    heroMediaAssetId: nullableBoundedString(value.heroMediaAssetId, 64),
    galleryCollectionId: nullableBoundedString(value.galleryCollectionId, 64),
    heroMedia: value.heroMedia === null ? null : parseHeroMedia(value.heroMedia),
    sectionOrder: sectionKeys(value.sectionOrder),
    disabledSections: sectionKeys(value.disabledSections, true),
    eventsTitle: boundedString(value.eventsTitle, 160),
    eventsDescription: boundedString(value.eventsDescription, 500),
    previousEventsTitle: boundedString(value.previousEventsTitle, 160),
    previousEventsDescription: boundedString(value.previousEventsDescription, 500),
    galleryTitle: boundedString(value.galleryTitle, 160),
    galleryDescription: boundedString(value.galleryDescription, 500),
  };
}
function parseHeroMedia(value: unknown) {
  if (!isRecord(value)) throw new Error("Invalid hero media.");
  return {
    id: requiredString(value.id),
    mediaType: nonNegativeInteger(value.mediaType),
    url: boundedString(value.url, 2048),
    posterUrl: nullableBoundedString(value.posterUrl, 2048),
    altText: nullableBoundedString(value.altText, 500),
  };
}
function sectionKeys(value: unknown, allowSubset = false) {
  if (!Array.isArray(value)) throw new Error("Invalid homepage section order.");
  const allowed = Object.values(HomepageSectionKey);
  const result = value.map((item) => {
    if (typeof item !== "string" || !allowed.includes(item as never))
      throw new Error("Invalid homepage section.");
    return item as (typeof allowed)[number];
  });
  if (!allowSubset && (result.length !== allowed.length || new Set(result).size !== result.length))
    throw new Error("Incomplete homepage section order.");
  return result;
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

function dateString(value: unknown): string {
  const result = requiredString(value);
  if (Number.isNaN(new Date(result).getTime())) throw new Error("Expected a date.");
  return result;
}
