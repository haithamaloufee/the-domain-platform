export const MediaType = {
  Image: 1,
  Video: 2,
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const MediaOrientation = {
  Unknown: 1,
  Portrait: 2,
  Landscape: 3,
  Square: 4,
} as const;

export type MediaOrientation = (typeof MediaOrientation)[keyof typeof MediaOrientation];

export const MediaApprovalStatus = {
  Draft: 1,
  Approved: 2,
  Hidden: 3,
} as const;

export type MediaApprovalStatus = (typeof MediaApprovalStatus)[keyof typeof MediaApprovalStatus];

export const EventMediaUsage = {
  Hero: 1,
  Cover: 2,
  Poster: 3,
  Gallery: 4,
  Thumbnail: 5,
  HomepagePreview: 6,
  PreviousEventPreview: 7,
} as const;

export type EventMediaUsage = (typeof EventMediaUsage)[keyof typeof EventMediaUsage];

export interface AdminMediaListItem {
  id: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl: string | null;
  orientation: MediaOrientation;
  category: string | null;
  approvalStatus: MediaApprovalStatus;
  createdAtUtc: string;
}

export interface AdminMediaDetails extends AdminMediaListItem {
  fileName: string;
  originalFileName: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  caption: string | null;
  altText: string | null;
  updatedAtUtc: string;
}

export type AdminMediaResponse = AdminMediaDetails;

export interface MediaListQuery {
  pageNumber?: number;
  pageSize?: number;
  mediaType?: string;
  approvalStatus?: string;
  category?: string;
  orientation?: string;
  eventId?: string;
  usage?: string;
  search?: string;
}

export interface UploadMediaRequestMetadata {
  category?: string;
  caption?: string;
  altText?: string;
  approvalStatus: MediaApprovalStatus;
  eventId?: string;
  usage?: EventMediaUsage;
  sortOrder?: number;
  isFeatured?: boolean;
}

export interface UpdateMediaMetadataRequest {
  category: string | null;
  caption: string | null;
  altText: string | null;
}

export interface AssignEventMediaRequest {
  mediaAssetId: string;
  usage: EventMediaUsage;
  sortOrder: number;
  isFeatured: boolean;
}

export interface UpdateEventMediaRequest {
  usage: EventMediaUsage;
  sortOrder: number;
  isFeatured: boolean;
}

export interface EventMediaResponse {
  id: string;
  eventId: string;
  mediaAssetId: string;
  usage: EventMediaUsage;
  sortOrder: number;
  isFeatured: boolean;
  createdAtUtc: string;
}

export interface AdminEventMediaItem extends EventMediaResponse {
  media: AdminMediaDetails;
}

export interface AdminMediaErrorResponse {
  message: string;
}
