import type {
  AdminHomepageContent,
  AdminPartner,
  AdminStatisticItem,
  CreatePartnerRequest,
  CreateStatisticRequest,
  UpdateHomepageContentRequest,
} from "@the-domain/types";

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
