import type {
  BrandingSettings,
  PublicBrandingSettings,
  UpdateBrandingSettingsRequest,
} from "@the-domain/types";
export const fallbackBranding: PublicBrandingSettings = {
  siteName: "The Domain Entertainment",
  brandDescription: "Premium entertainment experiences and events in Jordan.",
  defaultSeoTitle: "The Domain Entertainment",
  defaultSeoDescription: "Premium entertainment experiences and events in Jordan.",
  primaryLogo: null,
  alternateLogo: null,
  favicon: null,
  socialImage: null,
  publicEmail: null,
  publicPhone: null,
  whatsApp: null,
  publicAddress: null,
  socialLinks: {},
};
export function brandingRequest(value: BrandingSettings): UpdateBrandingSettingsRequest {
  return {
    siteName: value.siteName.trim(),
    brandDescription: value.brandDescription?.trim() || null,
    defaultSeoTitle: value.defaultSeoTitle.trim(),
    defaultSeoDescription: value.defaultSeoDescription.trim(),
    primaryLogoMediaAssetId: value.primaryLogoMediaAssetId,
    alternateLogoMediaAssetId: value.alternateLogoMediaAssetId,
    faviconMediaAssetId: value.faviconMediaAssetId,
    socialImageMediaAssetId: value.socialImageMediaAssetId,
    publicEmail: value.publicEmail?.trim() || null,
    publicPhone: value.publicPhone?.trim() || null,
    whatsApp: value.whatsApp?.trim() || null,
    publicAddress: value.publicAddress?.trim() || null,
    socialLinks: Object.fromEntries(
      Object.entries(value.socialLinks).map(([key, item]) => [key, item.trim() || null]),
    ),
  };
}
export function brandingChanged(left: BrandingSettings, right: BrandingSettings): boolean {
  return JSON.stringify(brandingRequest(left)) !== JSON.stringify(brandingRequest(right));
}
export function safeBrandingUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
export function alternateBrandLogo<T>(primary: T | null, alternate: T | null): T | null {
  return alternate ?? primary;
}
