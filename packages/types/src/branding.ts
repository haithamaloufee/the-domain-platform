export interface BrandingMedia {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}
export interface BrandingSettings {
  primaryLogoMediaAssetId: string | null;
  alternateLogoMediaAssetId: string | null;
  faviconMediaAssetId: string | null;
  socialImageMediaAssetId: string | null;
  primaryLogo: BrandingMedia | null;
  alternateLogo: BrandingMedia | null;
  favicon: BrandingMedia | null;
  socialImage: BrandingMedia | null;
  publicEmail: string | null;
  publicPhone: string | null;
  whatsApp: string | null;
  publicAddress: string | null;
  socialLinks: Record<string, string>;
}
export type PublicBrandingSettings = Omit<
  BrandingSettings,
  | "primaryLogoMediaAssetId"
  | "alternateLogoMediaAssetId"
  | "faviconMediaAssetId"
  | "socialImageMediaAssetId"
>;
export interface UpdateBrandingSettingsRequest {
  primaryLogoMediaAssetId: string | null;
  alternateLogoMediaAssetId: string | null;
  faviconMediaAssetId: string | null;
  socialImageMediaAssetId: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  whatsApp: string | null;
  publicAddress: string | null;
  socialLinks: Record<string, string | null>;
}
