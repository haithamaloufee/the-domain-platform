import {
  EventMediaUsage,
  MediaApprovalStatus,
  MediaOrientation,
  MediaType,
  VideoPosterMode,
  type AdminMediaDetails,
  type AdminEventMediaItem,
  type AdminMediaListItem,
  type AssignEventMediaRequest,
  type EventMediaResponse,
  type PagedResponse,
  type MediaCollection,
  type MediaCollectionItem,
  type MediaUsage,
  type UpdateEventCoverPresentationRequest,
  type UpdateEventMediaRequest,
  type UpdateMediaMetadataRequest,
} from "@the-domain/types";
import { defaultEventCoverPresentation, isValidEventCoverPresentation } from "@the-domain/utils";

export function parseMediaPage(value: unknown): PagedResponse<AdminMediaListItem> {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error("The server returned an invalid media list.");
  }

  return {
    pageNumber: integer(value.pageNumber),
    pageSize: integer(value.pageSize),
    totalCount: integer(value.totalCount),
    totalPages: integer(value.totalPages),
    hasNextPage: booleanValue(value.hasNextPage),
    hasPreviousPage: booleanValue(value.hasPreviousPage),
    items: value.items.map(parseMediaListItem),
  };
}

export function parseMediaDetails(value: unknown): AdminMediaDetails {
  if (!isRecord(value)) throw new Error("The server returned invalid media details.");
  return {
    ...parseMediaListItem(value),
    width: nullableNumber(value.width),
    height: nullableNumber(value.height),
    durationSeconds: nullableNumber(value.durationSeconds),
    updatedAtUtc: dateString(value.updatedAtUtc),
  };
}

export function parseEventMedia(value: unknown): EventMediaResponse {
  if (!isRecord(value)) throw new Error("The server returned an invalid media assignment.");
  return {
    id: requiredString(value.id),
    eventId: requiredString(value.eventId),
    mediaAssetId: requiredString(value.mediaAssetId),
    usage: enumValue(value.usage, EventMediaUsage),
    sortOrder: integer(value.sortOrder),
    isFeatured: booleanValue(value.isFeatured),
    createdAtUtc: dateString(value.createdAtUtc),
    presentation: parsePresentation(value.presentation),
    videoPoster: parseVideoPoster(value.videoPoster),
  };
}

export function parsePresentationRequest(
  value: unknown,
): UpdateEventCoverPresentationRequest | null {
  return isValidEventCoverPresentation(value) ? { ...value } : null;
}

export function parseAdminEventMediaList(value: unknown): AdminEventMediaItem[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid event media list.");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Expected an event media item.");
    return {
      ...parseEventMedia(item),
      media: parseMediaDetails(item.media),
    };
  });
}

export function parseMetadataRequest(value: unknown): UpdateMediaMetadataRequest | null {
  if (!isRecord(value)) return null;
  try {
    return {
      category: nullableBoundedString(value.category, 100),
      caption: nullableBoundedString(value.caption, 1_000),
      altText: nullableBoundedString(value.altText, 500),
    };
  } catch {
    return null;
  }
}

export function parseAssignmentRequest(value: unknown): AssignEventMediaRequest | null {
  if (!isRecord(value)) return null;
  try {
    return {
      mediaAssetId: requiredString(value.mediaAssetId),
      usage: enumValue(value.usage, EventMediaUsage),
      sortOrder: integer(value.sortOrder),
      isFeatured: booleanValue(value.isFeatured),
    };
  } catch {
    return null;
  }
}

export function parseAssignmentUpdate(value: unknown): UpdateEventMediaRequest | null {
  if (!isRecord(value)) return null;
  try {
    return {
      usage: enumValue(value.usage, EventMediaUsage),
      sortOrder: integer(value.sortOrder),
      isFeatured: booleanValue(value.isFeatured),
    };
  } catch {
    return null;
  }
}

function parseMediaListItem(value: unknown): AdminMediaListItem {
  if (!isRecord(value)) throw new Error("Expected a media list item.");
  return {
    id: requiredString(value.id),
    fileName: requiredString(value.fileName),
    originalFileName: requiredString(value.originalFileName),
    mediaType: enumValue(value.mediaType, MediaType),
    url: absoluteUrl(value.url),
    thumbnailUrl: nullableUrl(value.thumbnailUrl),
    orientation: enumValue(value.orientation, MediaOrientation),
    category: nullableString(value.category),
    caption: nullableString(value.caption),
    altText: nullableString(value.altText),
    approvalStatus: enumValue(value.approvalStatus, MediaApprovalStatus),
    isArchived: booleanValue(value.isArchived),
    archivedAtUtc: nullableDateString(value.archivedAtUtc),
    createdAtUtc: dateString(value.createdAtUtc),
  };
}

export function parseMediaCollections(value: unknown): MediaCollection[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid media collections.");
  return value.map(parseMediaCollection);
}
export function parseMediaCollection(value: unknown): MediaCollection {
  if (!isRecord(value)) throw new Error("Expected a media collection.");
  return {
    id: requiredString(value.id),
    name: requiredString(value.name),
    isArchived: booleanValue(value.isArchived),
    itemCount: integer(value.itemCount),
    createdAtUtc: dateString(value.createdAtUtc),
    updatedAtUtc: dateString(value.updatedAtUtc),
    archivedAtUtc: nullableDateString(value.archivedAtUtc),
  };
}
export function parseMediaCollectionItems(value: unknown): MediaCollectionItem[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid collection media.");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Expected collection media.");
    return {
      mediaAssetId: requiredString(item.mediaAssetId),
      sortOrder: integer(item.sortOrder),
      media: parseMediaListItem(item.media),
    };
  });
}
export function parseMediaUsage(value: unknown): MediaUsage {
  if (!isRecord(value) || !Array.isArray(value.events))
    throw new Error("The server returned invalid media usage.");
  return {
    mediaAssetId: requiredString(value.mediaAssetId),
    canPermanentlyDelete: booleanValue(value.canPermanentlyDelete),
    collections: parseMediaCollections(value.collections),
    events: value.events.map((event) => {
      if (!isRecord(event)) throw new Error("Expected event usage.");
      return {
        eventId: requiredString(event.eventId),
        eventTitle: requiredString(event.eventTitle),
        usage: enumValue(event.usage, EventMediaUsage),
        isCustomPoster: booleanValue(event.isCustomPoster),
      };
    }),
  };
}

function parsePresentation(value: unknown) {
  if (value === undefined || value === null) return { ...defaultEventCoverPresentation };
  if (!isValidEventCoverPresentation(value))
    throw new Error("The server returned invalid cover presentation settings.");
  return { ...value };
}

function parseVideoPoster(value: unknown) {
  if (!isRecord(value)) throw new Error("The server returned invalid video poster settings.");
  return {
    mode: enumValue(value.mode, VideoPosterMode),
    timestampSeconds: nullableNumber(value.timestampSeconds),
    customPosterMediaAssetId: nullableString(value.customPosterMediaAssetId),
    posterUrl: nullableUrl(value.posterUrl),
  };
}

export function parseVideoPosterRequest(value: unknown) {
  if (!isRecord(value)) return null;
  try {
    const mode = enumValue(value.mode, VideoPosterMode);
    const timestampSeconds = nullableNumber(value.timestampSeconds);
    const customPosterMediaAssetId = nullableString(value.customPosterMediaAssetId);
    if (mode === VideoPosterMode.Timestamp && (timestampSeconds === null || timestampSeconds < 0))
      return null;
    if (mode === VideoPosterMode.CustomImage && !customPosterMediaAssetId) return null;
    return { mode, timestampSeconds, customPosterMediaAssetId };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || !value) throw new Error("Expected a non-empty string.");
  return value;
}

function nullableString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Expected a string.");
  return value;
}

function nullableBoundedString(value: unknown, maximum: number): string | null {
  if (value === null || value === "") return null;
  const result = requiredString(value).trim();
  if (result.length > maximum) throw new Error("Text value is too long.");
  return result || null;
}

function integer(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value))
    throw new Error("Expected an integer.");
  return value;
}

function nullableNumber(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Expected a number.");
  return value;
}

function booleanValue(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Expected a boolean.");
  return value;
}

function dateString(value: unknown): string {
  const result = requiredString(value);
  if (Number.isNaN(new Date(result).getTime())) throw new Error("Expected a date string.");
  return result;
}
function nullableDateString(value: unknown): string | null {
  return value === null ? null : dateString(value);
}

function absoluteUrl(value: unknown): string {
  const result = requiredString(value);
  const url = new URL(result);
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Expected a media URL.");
  return result;
}

function nullableUrl(value: unknown): string | null {
  return value === null ? null : absoluteUrl(value);
}

function enumValue<T extends Record<string, number>>(value: unknown, values: T): T[keyof T] {
  if (Object.values(values).includes(value as number)) return value as T[keyof T];
  throw new Error("Expected an enum value.");
}
