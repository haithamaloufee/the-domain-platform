import {
  BookingAvailability,
  EventDisplayStatus,
  EventMediaUsage,
  MediaOrientation,
  MediaType,
  type PublicEventDetails,
  type PublicEventListItem,
  type PublicGalleryAlbum,
  type PublicGalleryAlbumDetails,
  type PublicMediaItem,
} from "@the-domain/types";

export function parsePublicEvents(value: unknown): PublicEventListItem[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid event list.");
  return value.map(parsePublicEventListItem);
}

function parsePublicEventListItem(value: unknown): PublicEventListItem {
  if (!isRecord(value)) throw new Error("The server returned an invalid event summary.");
  return {
    ...eventSummary(value),
    coverMedia: value.coverMedia === null ? null : mediaItem(value.coverMedia),
  };
}

export function parsePublicEvent(value: unknown): PublicEventDetails {
  if (!isRecord(value)) throw new Error("The server returned invalid event details.");
  return {
    ...eventSummary(value),
    longDescription: stringValue(value.longDescription),
    venueAddress: nullableString(value.venueAddress),
    mapUrl: nullableUrl(value.mapUrl),
    media: mediaList(value.media),
  };
}

function eventSummary(value: Record<string, unknown>): Omit<PublicEventListItem, "coverMedia"> {
  return {
    id: requiredString(value.id),
    slug: requiredString(value.slug),
    title: requiredString(value.title),
    shortDescription: stringValue(value.shortDescription),
    eventType: requiredString(value.eventType),
    startAtUtc: dateString(value.startAtUtc),
    endAtUtc: dateString(value.endAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    displayStatus: enumValue(value.displayStatus, EventDisplayStatus),
    bookingAvailability: enumValue(value.bookingAvailability, BookingAvailability),
    externalBookingUrl: nullableUrl(value.externalBookingUrl),
  };
}

export function parseGalleryAlbums(value: unknown): PublicGalleryAlbum[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid gallery list.");
  return value.map(parseGalleryAlbum);
}

export function parseGalleryAlbum(value: unknown): PublicGalleryAlbum {
  if (!isRecord(value)) throw new Error("The server returned an invalid gallery album.");
  return {
    eventId: requiredString(value.eventId),
    eventSlug: requiredString(value.eventSlug),
    title: requiredString(value.title),
    eventStartAtUtc: dateString(value.eventStartAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    mediaCount: integer(value.mediaCount),
    photoCount: integer(value.photoCount),
    videoCount: integer(value.videoCount),
    coverMedia: mediaItem(value.coverMedia),
  };
}

export function parseGalleryAlbumDetails(value: unknown): PublicGalleryAlbumDetails {
  if (!isRecord(value)) throw new Error("The server returned invalid gallery album details.");
  return {
    eventId: requiredString(value.eventId),
    eventSlug: requiredString(value.eventSlug),
    title: requiredString(value.title),
    eventStartAtUtc: dateString(value.eventStartAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    media: mediaList(value.media),
  };
}

function mediaList(value: unknown): PublicMediaItem[] {
  if (!Array.isArray(value)) throw new Error("Expected a media list.");
  return value.map(mediaItem);
}

function mediaItem(item: unknown): PublicMediaItem {
  if (!isRecord(item)) throw new Error("Expected a media item.");
  return {
    id: requiredString(item.id),
    mediaType: enumValue(item.mediaType, MediaType),
    url: absoluteUrl(item.url),
    thumbnailUrl: nullableUrl(item.thumbnailUrl),
    caption: nullableString(item.caption),
    altText: nullableString(item.altText),
    width: nullableNumber(item.width),
    height: nullableNumber(item.height),
    durationSeconds: nullableNumber(item.durationSeconds),
    orientation: enumValue(item.orientation, MediaOrientation),
    usage: enumValue(item.usage, EventMediaUsage),
    sortOrder: integer(item.sortOrder),
    isFeatured: booleanValue(item.isFeatured),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string {
  const result = stringValue(value);
  if (!result) throw new Error("Expected a non-empty string.");
  return result;
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected a string.");
  return value;
}

function nullableString(value: unknown): string | null {
  return value === null ? null : stringValue(value);
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

function absoluteUrl(value: unknown): string {
  const result = requiredString(value);
  const url = new URL(result);
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Expected an HTTP media URL.");
  return result;
}

function nullableUrl(value: unknown): string | null {
  return value === null ? null : absoluteUrl(value);
}

function enumValue<T extends Record<string, number>>(value: unknown, values: T): T[keyof T] {
  if (Object.values(values).includes(value as number)) return value as T[keyof T];
  throw new Error("Expected an enum value.");
}
