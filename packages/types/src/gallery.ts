import type { MediaApprovalStatus, MediaOrientation, MediaType } from "./media";
export const GalleryLayoutPreset = {
  Editorial: 1,
  Balanced: 2,
  FeatureFirst: 3,
  Compact: 4,
} as const;
export type GalleryLayoutPreset = (typeof GalleryLayoutPreset)[keyof typeof GalleryLayoutPreset];
export interface GalleryAdminMedia {
  id: string;
  originalFileName: string;
  mediaType: MediaType;
  url: string;
  posterUrl: string | null;
  caption: string | null;
  altText: string | null;
  approvalStatus: MediaApprovalStatus;
  isArchived: boolean;
  sortOrder: number;
  isPubliclyEligible: boolean;
  exclusionReason: string | null;
}
export interface GalleryAdminCollection {
  id: string;
  name: string;
  isArchived: boolean;
  isPublished: boolean;
  gallerySortOrder: number;
  publicTitle: string | null;
  publicDescription: string | null;
  layoutPreset: GalleryLayoutPreset;
  featuredMediaAssetId: string | null;
  totalMediaCount: number;
  eligibleMediaCount: number;
  media: GalleryAdminMedia[];
}
export interface GalleryPublicMedia {
  id: string;
  mediaType: MediaType;
  url: string;
  posterUrl: string | null;
  caption: string | null;
  altText: string | null;
  orientation: MediaOrientation;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sortOrder: number;
}
export interface GalleryPublicCollection {
  id: string;
  title: string;
  description: string | null;
  layoutPreset: GalleryLayoutPreset;
  featuredMediaId: string | null;
  media: GalleryPublicMedia[];
}
export interface SaveGalleryPresentationRequest {
  title: string | null;
  description: string | null;
  layoutPreset: GalleryLayoutPreset;
  featuredMediaAssetId: string | null;
}
