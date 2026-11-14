import type { PublicEventListItem } from "./events";
import type { GalleryLayoutPreset } from "./gallery";
import type { PublicGalleryAlbum } from "./media";
import type { MediaType } from "./media";

export const HomepageSectionKey = {
  Events: "events",
  Statistics: "statistics",
  Why: "why",
  Previous: "previous",
  Gallery: "gallery",
  Services: "services",
  Partners: "partners",
  Contact: "contact",
} as const;
export type HomepageSectionKey = (typeof HomepageSectionKey)[keyof typeof HomepageSectionKey];

export interface HomepageMediaSummary {
  id: string;
  mediaType: MediaType;
  url: string;
  posterUrl: string | null;
  altText: string | null;
}
export interface HomepagePresentation {
  heroMedia: HomepageMediaSummary | null;
  floatingVideo: { video: HomepageMediaSummary; poster: HomepageMediaSummary | null } | null;
  statisticsMotionEnabled: boolean;
}
export interface HomepageStatistic {
  slotNumber: 1 | 2 | 3 | 4;
  value: string;
  suffix: string | null;
}
export interface HomepageCollectionPreview {
  kind: "collection";
  id: string;
  title: string;
  description: string | null;
  layoutPreset: GalleryLayoutPreset;
  highlightCount: number;
  photoCount: number;
  videoCount: number;
  coverMedia: HomepageMediaSummary | null;
}
export interface HomepageAlbumPreview {
  kind: "albums";
  albums: PublicGalleryAlbum[];
}
export type HomepageGalleryPreview = HomepageCollectionPreview | HomepageAlbumPreview | null;

export interface PublicStatisticItem {
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
}
export interface PublicPartner {
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  isFeatured: boolean;
}
export interface PublicHomepageResponse {
  presentation: HomepagePresentation;
  statistics: HomepageStatistic[];
  currentEvents: PublicEventListItem[];
  previousEvents: PublicEventListItem[];
  galleryPreview: HomepageGalleryPreview;
  partners: PublicPartner[];
}
export interface StatisticsPresentation {
  isEnabled: boolean;
}

export interface HomepageBuilderSettings {
  heroMediaAssetId: string | null;
  galleryCollectionId: string | null;
  heroMedia: HomepageMediaSummary | null;
  isFloatingVideoEnabled: boolean;
  floatingVideoMediaAssetId: string | null;
  floatingVideoPosterMediaAssetId: string | null;
  floatingVideoMedia: HomepageMediaSummary | null;
  floatingVideoPoster: HomepageMediaSummary | null;
}
export interface UpdateHomepageContentRequest {
  isPublished: boolean;
  heroMediaAssetId: string | null;
  galleryCollectionId: string | null;
  isFloatingVideoEnabled: boolean;
  floatingVideoMediaAssetId: string | null;
  floatingVideoPosterMediaAssetId: string | null;
}
export interface AdminHomepageContent extends UpdateHomepageContentRequest {
  id: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  builder: HomepageBuilderSettings;
}
export interface CreateStatisticRequest {
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  isVerified: boolean;
}
export type UpdateStatisticRequest = CreateStatisticRequest;
export interface AdminStatisticItem extends CreateStatisticRequest {
  id: string;
  slotNumber: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}
export interface CreatePartnerRequest {
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  logoMediaAssetId: string | null;
}
export type UpdatePartnerRequest = CreatePartnerRequest;
export interface AdminPartner extends CreatePartnerRequest {
  id: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}
