import {
  BookingAvailability,
  EventDisplayStatus,
  EventPublicationStatus,
  type AdminEventDetails,
  type SaveEventRequest,
} from "@the-domain/types";

const maximumTextLength = 10_000;

export function parseAdminEvent(value: unknown): AdminEventDetails {
  if (!isRecord(value)) throw new Error("The server returned an invalid event response.");

  const event: AdminEventDetails = {
    id: requiredString(value.id),
    slug: requiredString(value.slug),
    title: requiredString(value.title),
    shortDescription: stringValue(value.shortDescription),
    longDescription: stringValue(value.longDescription),
    eventType: requiredString(value.eventType),
    startAtUtc: dateString(value.startAtUtc),
    endAtUtc: dateString(value.endAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    venueAddress: nullableString(value.venueAddress),
    mapUrl: nullableString(value.mapUrl),
    externalBookingUrl: nullableString(value.externalBookingUrl),
    isBookingEnabled: booleanValue(value.isBookingEnabled),
    bookingOpensAtUtc: nullableDateString(value.bookingOpensAtUtc),
    bookingClosesAtUtc: nullableDateString(value.bookingClosesAtUtc),
    publicationStatus: publicationStatus(value.publicationStatus),
    displayStatus: displayStatus(value.displayStatus),
    bookingAvailability: bookingAvailability(value.bookingAvailability),
    isFeatured: booleanValue(value.isFeatured),
    showOnHomepage: booleanValue(value.showOnHomepage),
    createdAtUtc: dateString(value.createdAtUtc),
    updatedAtUtc: dateString(value.updatedAtUtc),
  };

  return event;
}

export function parseAdminEvents(value: unknown): AdminEventDetails[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid events response.");
  return value.map(parseAdminEvent);
}

export function parseSaveEventRequest(value: unknown): SaveEventRequest | null {
  if (!isRecord(value)) return null;

  try {
    return {
      slug: boundedString(value.slug),
      title: boundedString(value.title),
      shortDescription: boundedString(value.shortDescription),
      longDescription: boundedString(value.longDescription),
      eventType: boundedString(value.eventType),
      startAtUtc: dateString(value.startAtUtc),
      endAtUtc: dateString(value.endAtUtc),
      timeZoneId: boundedString(value.timeZoneId),
      city: boundedString(value.city),
      venueName: boundedString(value.venueName),
      venueAddress: nullableBoundedString(value.venueAddress),
      mapUrl: nullableBoundedString(value.mapUrl),
      externalBookingUrl: nullableBoundedString(value.externalBookingUrl),
      isBookingEnabled: booleanValue(value.isBookingEnabled),
      bookingOpensAtUtc: nullableDateString(value.bookingOpensAtUtc),
      bookingClosesAtUtc: nullableDateString(value.bookingClosesAtUtc),
      isFeatured: booleanValue(value.isFeatured),
      showOnHomepage: booleanValue(value.showOnHomepage),
    };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string {
  const result = stringValue(value);
  if (!result) throw new Error("Expected a non-empty string.");
  return result;
}

function boundedString(value: unknown): string {
  const result = stringValue(value);
  if (result.length > maximumTextLength) throw new Error("Text value is too long.");
  return result;
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected a string.");
  return value;
}

function nullableString(value: unknown): string | null {
  if (value === null) return null;
  return stringValue(value);
}

function nullableBoundedString(value: unknown): string | null {
  if (value === null || value === "") return null;
  return boundedString(value);
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
  if (value === null || value === "") return null;
  return dateString(value);
}

function publicationStatus(value: unknown): AdminEventDetails["publicationStatus"] {
  if (Object.values(EventPublicationStatus).includes(value as never))
    return value as AdminEventDetails["publicationStatus"];
  throw new Error("Expected an event publication status.");
}

function displayStatus(value: unknown): AdminEventDetails["displayStatus"] {
  if (Object.values(EventDisplayStatus).includes(value as never))
    return value as AdminEventDetails["displayStatus"];
  throw new Error("Expected an event display status.");
}

function bookingAvailability(value: unknown): AdminEventDetails["bookingAvailability"] {
  if (Object.values(BookingAvailability).includes(value as never))
    return value as AdminEventDetails["bookingAvailability"];
  throw new Error("Expected a booking availability status.");
}
