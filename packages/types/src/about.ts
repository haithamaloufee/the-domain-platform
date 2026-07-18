import type { MediaType } from "./media";
import type { PublicPartner } from "./homepage";

export const AboutHeroPresentation = {
  FullBleed: 1,
  EditorialSplit: 2,
  ContainedCinematic: 3,
  MinimalStatement: 4,
} as const;
export type AboutHeroPresentation =
  (typeof AboutHeroPresentation)[keyof typeof AboutHeroPresentation];
export interface AboutMedia {
  id: string;
  mediaType: MediaType;
  url: string;
  posterUrl: string | null;
  altText: string | null;
}
export interface SaveAboutSettingsRequest {
  isPublished: boolean;
  isHeroEnabled: boolean;
  heroMediaAssetId: string | null;
  heroPresentation: AboutHeroPresentation;
  isStoryEnabled: boolean;
  isTeamEnabled: boolean;
  isPartnersEnabled: boolean;
  isReachOutEnabled: boolean;
  socialImageMediaAssetId: string | null;
}
export interface AdminAboutSettings extends SaveAboutSettingsRequest {
  id: string;
  heroMedia: AboutMedia | null;
  socialImage: AboutMedia | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}
export interface SaveTeamMemberRequest {
  name: string;
  role: string;
  biography: string | null;
  photoMediaAssetId: string;
  profileUrl: string | null;
  isVisible: boolean;
}
export interface AdminTeamMember extends SaveTeamMemberRequest {
  id: string;
  photoUrl: string;
  photoAltText: string | null;
  sortOrder: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}
export interface PublicAboutSettings extends Omit<
  SaveAboutSettingsRequest,
  "isPublished" | "heroMediaAssetId" | "socialImageMediaAssetId"
> {
  heroMedia: AboutMedia | null;
  socialImageUrl: string | null;
}
export interface PublicTeamMember {
  id: string;
  name: string;
  role: string;
  biography: string | null;
  photoUrl: string;
  photoAltText: string | null;
  profileUrl: string | null;
}
export interface PublicAboutResponse {
  settings: PublicAboutSettings;
  team: PublicTeamMember[];
  partners: PublicPartner[];
}
