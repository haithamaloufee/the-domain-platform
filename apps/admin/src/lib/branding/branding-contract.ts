import type { BrandingMedia, BrandingSettings } from "@the-domain/types";
export function parseBrandingSettings(value: unknown): BrandingSettings {
  if (!record(value)) throw new Error("The server returned invalid Branding Settings.");
  return {
    siteName: required(value.siteName),
    brandDescription: nullable(value.brandDescription),
    defaultSeoTitle: required(value.defaultSeoTitle),
    defaultSeoDescription: required(value.defaultSeoDescription),
    primaryLogoMediaAssetId: nullable(value.primaryLogoMediaAssetId),
    alternateLogoMediaAssetId: nullable(value.alternateLogoMediaAssetId),
    faviconMediaAssetId: nullable(value.faviconMediaAssetId),
    socialImageMediaAssetId: nullable(value.socialImageMediaAssetId),
    primaryLogo: media(value.primaryLogo),
    alternateLogo: media(value.alternateLogo),
    favicon: media(value.favicon),
    socialImage: media(value.socialImage),
    publicEmail: nullable(value.publicEmail),
    publicPhone: nullable(value.publicPhone),
    whatsApp: nullable(value.whatsApp),
    publicAddress: nullable(value.publicAddress),
    socialLinks: links(value.socialLinks),
  };
}
function media(value: unknown): BrandingMedia | null {
  if (value === null) return null;
  if (!record(value)) throw new Error("Invalid branding media.");
  return {
    id: required(value.id),
    url: https(value.url),
    altText: nullable(value.altText),
    width: numberOrNull(value.width),
    height: numberOrNull(value.height),
  };
}
function links(value: unknown): Record<string, string> {
  if (!record(value)) throw new Error("Invalid social links.");
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, https(item)]));
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function required(value: unknown) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Expected text.");
  return value;
}
function nullable(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Expected optional text.");
  return value;
}
function numberOrNull(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Expected a number.");
  return value;
}
function https(value: unknown) {
  const result = required(value);
  if (new URL(result).protocol !== "https:") throw new Error("Expected HTTPS.");
  return result;
}
